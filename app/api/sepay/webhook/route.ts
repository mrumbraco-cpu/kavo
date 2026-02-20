import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { checkOrderStatus } from '@/lib/sepay'
import { resolveCoinsForAmount } from '@/lib/coins/resolveCoins'

export async function POST(req: NextRequest) {
    try {
        console.log('SePay Webhook received')

        let body: any = {}
        const contentType = req.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
            try {
                body = await req.json()
            } catch (e) {
                console.error('Failed to parse JSON body', e)
                return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 })
            }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData()
            body = Object.fromEntries(formData.entries())
        }

        console.log('Webhook payload:', body)

        const orderId = body.order_invoice_number || body.referenceCode || body.id

        if (!orderId) {
            console.error('Missing order identifier in webhook payload')
            return NextResponse.json({ success: false, message: 'Missing order_invoice_number' }, { status: 400 })
        }

        // Verify with SePay API
        const response = await checkOrderStatus(orderId)
        const orders = response?.data || []
        const order = orders.find((o: any) => o.order_invoice_number === orderId || o.order_id === orderId)

        if (!order) {
            console.error(`Order ${orderId} not found in SePay`)
            return NextResponse.json({ success: false, message: 'Order not found in SePay' }, { status: 404 })
        }

        if (order.order_status !== 'CAPTURED') {
            console.log(`Order ${orderId} status is ${order.order_status}, ignoring.`)
            return NextResponse.json({ success: true, message: 'Ignored non-captured order' })
        }

        const userId = order.customer_id
        if (!userId) {
            console.error('Missing customer_id in order details')
            return NextResponse.json({ success: false, message: 'Missing customer_id in order' }, { status: 400 })
        }

        const amountVnd = parseInt(order.order_amount)

        // Resolve coins server-side using tiers + base rate
        const resolution = await resolveCoinsForAmount(amountVnd)
        const coinsToCredit = resolution.coins

        console.log(`Coin resolution for ${amountVnd} VNĐ: ${coinsToCredit} xu (source: ${resolution.source})`)

        const supabase = createServiceRoleClient()

        const { data: rpcResult, error: rpcError } = await supabase
            .rpc('process_topup_transaction', {
                p_user_id: userId,
                p_amount: amountVnd,
                p_coins: coinsToCredit,
                p_reference: orderId,
                p_metadata: {
                    sepay_order_id: order.id,
                    description: order.order_description,
                    source: 'webhook',
                    resolution_source: resolution.source,
                    tier_id: resolution.tier_id ?? null,
                    base_rate_used: resolution.base_rate_used,
                }
            })

        if (rpcError) {
            console.error('RPC Error in Webhook:', rpcError)
            return NextResponse.json({ success: false, message: 'RPC Error' }, { status: 500 })
        }

        const result = rpcResult as any

        if (result && !result.success) {
            if (result.message === 'Transaction already processed') {
                console.log(`Order ${orderId} already processed (idempotent)`)
                return NextResponse.json({ success: true, message: 'Already processed' })
            }
            console.error('RPC Logical Error:', result.message)
            return NextResponse.json({ success: false, message: result.message }, { status: 400 })
        }

        console.log(`Successfully processed Topup for user ${userId}: ${amountVnd} VNĐ → ${coinsToCredit} xu`)
        return NextResponse.json({ success: true, message: 'Processed successfully' })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
    }
}
