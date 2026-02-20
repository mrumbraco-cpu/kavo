'use server'

import { createPaymentUrl, checkOrderStatus } from '@/lib/sepay'
import { requireAuth } from '@/lib/auth/requireAuth'
import { headers } from 'next/headers'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resolveCoinsForAmount, getTopupDisplayData } from '@/lib/coins/resolveCoins'

export async function createPaymentRequest(amount: number, nextPath?: string) {
    try {
        const user = await requireAuth()

        // Fetch min topup from config
        const { baseRate } = await getTopupDisplayData()
        const minTopup = baseRate.min_topup_vnd ?? 10000

        if (!amount || amount < minTopup) {
            return { success: false, error: `Số tiền nạp tối thiểu là ${minTopup.toLocaleString('vi-VN')} VNĐ` }
        }

        const headerList = await headers()
        const host = headerList.get('x-forwarded-host') || headerList.get('host')
        const protocol = headerList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https')
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

        const shortId = Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString().padStart(2, '0')
        const orderId = `SP${shortId}`
        const description = `Nap_xu_${amount}_VND`

        const nextQuery = nextPath ? `&next=${encodeURIComponent(nextPath)}` : ''

        const { endpoint, payload } = createPaymentUrl({
            amount,
            orderId,
            description,
            userId: user.id,
            successUrl: `${baseUrl}/dashboard/coins/topup/success?order_id=${orderId}${nextQuery}`,
            errorUrl: `${baseUrl}/dashboard/coins/topup/error?order_id=${orderId}${nextQuery}`,
            cancelUrl: `${baseUrl}/dashboard/coins/topup?status=cancelled&order_id=${orderId}${nextQuery}`,
        })

        return { success: true, endpoint, payload }
    } catch (error) {
        console.error('Create payment error:', error)
        return { success: false, error: 'Không thể tạo yêu cầu thanh toán' }
    }
}

export async function verifyTransaction(orderId: string) {
    try {
        const user = await requireAuth()
        const supabase = createServiceRoleClient()

        // 1. Idempotency: check if already processed
        const { data: existingTx } = await supabase
            .from('coin_transactions')
            .select('id')
            .eq('reference', orderId)
            .single()

        if (existingTx) {
            return { success: true, message: 'Giao dịch đã được xử lý trước đó.' }
        }

        // 2. Verify with SePay
        const response = await checkOrderStatus(orderId)
        const orders = response?.data || []
        const order = orders.find((o: any) => o.order_invoice_number === orderId || o.order_id === orderId)

        if (!order) {
            return { success: false, error: 'Không tìm thấy thông tin đơn hàng từ SePay.' }
        }

        if (order.order_status !== 'CAPTURED') {
            return {
                success: false,
                error: `Giao dịch chưa hoàn tất via SePay (Trạng thái: ${order.order_status}).`
            }
        }

        // Verify ownership
        if (order.customer_id && order.customer_id !== user.id) {
            return { success: false, error: 'Order does not belong to this user.' }
        }

        const amountVnd = parseInt(order.order_amount)

        // 3. Resolve coins server-side
        const resolution = await resolveCoinsForAmount(amountVnd)
        const coinsToCredit = resolution.coins

        // 4. Process atomically
        const { data: rpcResult, error: rpcError } = await supabase
            .rpc('process_topup_transaction', {
                p_user_id: user.id,
                p_amount: amountVnd,
                p_coins: coinsToCredit,
                p_reference: orderId,
                p_metadata: {
                    sepay_order_id: order.id,
                    description: order.order_description,
                    source: 'client_verify',
                    resolution_source: resolution.source,
                    tier_id: resolution.tier_id ?? null,
                    base_rate_used: resolution.base_rate_used,
                }
            })

        if (rpcError) {
            console.error('RPC Error:', rpcError)
            return { success: false, error: 'Lỗi hệ thống: Vui lòng liên hệ Admin (Code: RPC_FAIL).' }
        }

        const result = rpcResult as any

        if (result && !result.success) {
            if (result.message === 'Transaction already processed') {
                return { success: true, message: 'Giao dịch đã được xử lý.' }
            }
            return { success: false, error: result.message }
        }

        revalidatePath('/dashboard/coins')

        return { success: true, message: 'Nạp xu thành công!', coinsCredited: coinsToCredit }

    } catch (error) {
        console.error('Verify transaction error:', error)
        return { success: false, error: 'Lỗi khi xác thực giao dịch.' }
    }
}
