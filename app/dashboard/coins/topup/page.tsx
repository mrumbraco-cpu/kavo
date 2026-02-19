'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createPaymentRequest } from '@/app/dashboard/coins/topup/actions'
import { Coins, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function TopupPage() {
    const router = useRouter()
    const [amount, setAmount] = useState<string>('50000') // Default 50k
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Predefined amounts
    const amounts = [
        { value: 50000, label: '50.000 xu' },
        { value: 100000, label: '100.000 xu' },
        { value: 200000, label: '200.000 xu' },
        { value: 500000, label: '500.000 xu' },
        { value: 1000000, label: '1.000.000 xu' },
    ]

    const searchParams = useSearchParams()

    // Auto-verify if status is cancelled but order_id exists (Handling SePay race condition)
    useEffect(() => {
        const checkStatus = async () => {
            const status = searchParams.get('status')
            const orderId = searchParams.get('order_id')

            if (status === 'cancelled' && orderId) {
                setIsLoading(true)
                try {
                    // Double check if it was actually successful
                    const { verifyTransaction } = await import('@/app/dashboard/coins/topup/actions')
                    const result = await verifyTransaction(orderId)

                    if (result.success) {
                        // Actually success! Redirect to success page
                        router.push(`/dashboard/coins/topup/success?order_id=${orderId}`)
                        return
                    }
                    else {
                        // Really cancelled or failed
                        setError('Giao dịch đã bị hủy hoặc chưa hoàn tất.')
                    }
                } catch (e) {
                    console.error('Verify error', e)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        checkStatus()
    }, [searchParams, router])

    const handlePayment = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await createPaymentRequest(parseInt(amount))
            if (result.success && result.endpoint) {
                // Determine if we need to POST (payload exists) or GET (link only)
                // SePay SDK usually returns a full Checkout URL (GET) if no payload is separate.
                // But our action returns { endpoint, payload } from SDK output.

                // If payload is empty or simple object, we can try direct redirect if endpoint is full URL?
                // Our action returns endpoint = baseUrl, payload = query params.
                // So we stick to form POST or GET. SePay supports both usually? 
                // SDK generated URL is usually GET. 
                // Let's stick to existing logic which worked (Form POST).

                const form = document.createElement('form')
                form.method = 'POST' // or GET? SePay usually GET for checkoutUrl.
                // Wait, previous logs showed POST working.

                // Correction: SePay SDK `checkoutUrl` returns a full URL with query params.
                // My new `sepay.ts` returns `endpoint` = `baseUrl` and `payload` = params.
                // So constructing a form with these params sends them as BODY (POST) or QUERY (GET)?
                // `form.action` = endpoint.

                // IMPORTANT: If `endpoint` is `https://sepay.vn/checkout`, it usually expects GET params or POST body.
                // Let's assume POST works as before.

                form.action = result.endpoint
                form.method = 'POST' // Try POST first as it hides params better, but GET is safer for "Links".
                // SePay docs say "Redirect to URL". URL implies GET.
                // But let's check: previous successful attempts used the Form submission logic.
                // So I will keep it.

                Object.entries(result.payload).forEach(([key, value]) => {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = key
                    input.value = String(value)
                    form.appendChild(input)
                })

                document.body.appendChild(form)
                form.submit()
            } else {
                setError(result.error || 'Có lỗi xảy ra khi tạo giao dịch')
                setIsLoading(false)
            }
        } catch (err) {
            console.error(err)
            setError('Có lỗi xảy ra khi kết nối đến server')
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link
                href="/dashboard/coins"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại ví của bạn
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Coins className="w-6 h-6 text-yellow-500" />
                        Nạp xu vào tài khoản
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Chọn mệnh giá xu bạn muốn nạp. Tỷ lệ quy đổi: 1.000 VNĐ = 1.000 xu
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Amount Selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {amounts.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setAmount(opt.value.toString())}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${parseInt(amount) === opt.value
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Amount Input */}
                    <div>
                        <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Hoặc nhập số tiền tùy chọn (tối thiểu 10.000đ)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="custom-amount"
                                min="10000"
                                step="1000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                                placeholder="Nhập số tiền..."
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                VNĐ
                            </span>
                        </div>
                        {parseInt(amount) < 10000 && amount !== '' && (
                            <p className="mt-2 text-xs text-red-500">
                                Số tiền nạp tối thiểu là 10.000 VNĐ
                            </p>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center border border-gray-200">
                        <div>
                            <p className="text-sm text-gray-500">Tổng thanh toán</p>
                            <p className="text-lg font-bold text-gray-900">
                                {parseInt(amount || '0').toLocaleString('vi-VN')} VNĐ
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Số xu nhận được</p>
                            <p className="text-lg font-bold text-yellow-600">
                                {parseInt(amount || '0').toLocaleString('vi-VN')} xu
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={isLoading || parseInt(amount) < 10000}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Thanh toán qua SePay
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        Giao dịch được xử lý an toàn bởi SePay. Số dư sẽ được cộng tự động ngay sau khi thanh toán thành công.
                    </p>
                </div>
            </div>
        </div>
    )
}
