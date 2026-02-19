'use server'

import { createPaymentUrl, checkOrderStatus } from '@/lib/sepay'
import { requireAuth } from '@/lib/auth/requireAuth'
import { headers } from 'next/headers'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPaymentRequest(amount: number) {
    try {
        const user = await requireAuth()

        // Validate amount
        if (!amount || amount < 10000) {
            return { success: false, error: 'Số tiền nạp tối thiểu là 10.000 VNĐ' }
        }

        const headerList = await headers()
        const host = headerList.get('x-forwarded-host') || headerList.get('host')
        const protocol = headerList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https')

        // Prioritize NEXT_PUBLIC_APP_URL if set (e.g. for ngrok), otherwise use detected host
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

        // Generate unique order ID
        const shortId = Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString().padStart(2, '0')
        const orderId = `SP${shortId}`
        // Simplify description to ASCII only, no spaces
        const description = `Nap_xu_${amount}_VND`

        const { endpoint, payload } = createPaymentUrl({
            amount,
            orderId,
            description,
            userId: user.id,
            successUrl: `${baseUrl}/dashboard/coins/topup/success?order_id=${orderId}`,
            errorUrl: `${baseUrl}/dashboard/coins/topup/error?order_id=${orderId}`,
            cancelUrl: `${baseUrl}/dashboard/coins/topup?status=cancelled&order_id=${orderId}`,
        })

        return {
            success: true,
            endpoint,
            payload,
        }
    } catch (error) {
        console.error('Create payment error:', error)
        return { success: false, error: 'Không thể tạo yêu cầu thanh toán' }
    }
}

export async function verifyTransaction(orderId: string) {
    try {
        const user = await requireAuth()
        // Use service role client for balance updates to bypass RLS restrictions on coin_balance
        const supabase = createServiceRoleClient()

        // 1. Check if transaction already exists in our DB
        const { data: existingTx } = await supabase
            .from('coin_transactions')
            .select('id')
            .eq('reference', orderId)
            .single()

        if (existingTx) {
            return { success: true, message: 'Giao dịch đã được xử lý trước đó.' }
        }

        // 2. Call SePay API to verify status
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

        // 3. Process the transaction using atomic RPC
        const amount = parseInt(order.order_amount)

        // Use RPC to handle transaction + balance update atomically
        const { data: rpcResult, error: rpcError } = await supabase
            .rpc('process_topup_transaction', {
                p_user_id: user.id,
                p_amount: amount,
                p_reference: orderId,
                p_metadata: {
                    sepay_order_id: order.id,
                    description: order.order_description,
                    source: 'client_verify'
                }
            })

        if (rpcError) {
            console.error('RPC Error:', rpcError)
            // Fallback for when RPC is not yet applied (Critical fix for Double Charge is the Unique Constraint)
            // If RPC missing, we return error to prompt user maintenance, or we could fallback to unsafe method.
            // But allowing double charge is worse.
            return { success: false, error: 'Lỗi hệ thống: Vui lòng liên hệ Admin (Code: RPC_FAIL).' }
        }

        // RPC returns { success: boolean, message: string }
        // Type casting result if needed, but in JS it's loose.
        const result = rpcResult as any;

        if (result && !result.success) {
            // Logic error handled by RPC (e.g. user not found)
            // or "Transaction already processed" (which is technically a success for the user flow)
            if (result.message === 'Transaction already processed') {
                return { success: true, message: 'Giao dịch đã được xử lý.' }
            }
            return { success: false, error: result.message }
        }

        revalidatePath('/dashboard/coins')

        return { success: true, message: 'Nạp xu thành công!' }

    } catch (error) {
        console.error('Verify transaction error:', error)
        return { success: false, error: 'Lỗi khi xác thực giao dịch.' }
    }
}
