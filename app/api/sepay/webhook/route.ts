import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { checkOrderStatus } from '@/lib/sepay'

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

        // SePay usually sends 'order_invoice_number' in payload if it's based on form submission
        // If not, we might look for 'referenceCode' or 'id'
        const orderId = body.order_invoice_number || body.referenceCode || body.id

        if (!orderId) {
            console.error('Missing order identifier in webhook payload')
            return NextResponse.json({ success: false, message: 'Missing order_invoice_number' }, { status: 400 })
        }

        // Verify with SePay API
        const response = await checkOrderStatus(orderId)
        const orders = response?.data || []
        // SePay search might return multiple if not unique, but order_invoice_number is unique per our logic.
        // We match strictly.
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

        const amount = parseInt(order.order_amount)

        // Process transaction using RPC
        const supabase = createServiceRoleClient()

        // Use RPC to handle transaction + balance update atomically
        const { data: rpcResult, error: rpcError } = await supabase
            .rpc('process_topup_transaction', {
                p_user_id: userId,
                p_amount: amount,
                p_reference: orderId,
                p_metadata: {
                    sepay_order_id: order.id,
                    description: order.order_description,
                    source: 'webhook'
                }
            })

        if (rpcError) {
            console.error('RPC Error in Webhook:', rpcError)
            // Retry later? Webhook usually retries on failure.
            return NextResponse.json({ success: false, message: 'RPC Error' }, { status: 500 })
        }

        const result = rpcResult as any;

        if (result && !result.success) {
            if (result.message === 'Transaction already processed') {
                console.log(`Order ${orderId} already processed (idempotent)`)
                return NextResponse.json({ success: true, message: 'Already processed' })
            }
            console.error('RPC Logical Error:', result.message)
            return NextResponse.json({ success: false, message: result.message }, { status: 400 })
        }

        console.log(`Successfully processed Topup for user ${userId} amount ${amount}`)
        return NextResponse.json({ success: true, message: 'Processed successfully' })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
    }
}
