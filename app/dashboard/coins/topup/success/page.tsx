'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyTransaction } from '@/app/dashboard/coins/topup/actions'
import { CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const verify = async () => {
            const orderId = searchParams.get('order_id')
            if (!orderId) {
                setStatus('error')
                setMessage('Không tìm thấy mã đơn hàng')
                return
            }

            try {
                const result = await verifyTransaction(orderId)
                if (result.success) {
                    setStatus('success')
                    setMessage(result.message || 'Giao dịch thành công')
                } else {
                    setStatus('error')
                    setMessage(result.error || 'Giao dịch thất bại')
                }
            } catch (error) {
                setStatus('error')
                setMessage('Lỗi kết nối đến server')
            }
        }

        verify()
    }, [searchParams])

    if (status === 'loading') {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Đang xác thực giao dịch...</h2>
                <p className="text-gray-500 mt-2">Vui lòng không tắt trình duyệt</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Giao dịch thất bại</h2>
                <p className="text-red-500 mt-2 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/dashboard/coins/topup"
                        className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Thử lại
                    </Link>
                    <Link
                        href="/dashboard/coins"
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Về ví của tôi
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Nạp xu thành công!</h2>
            <p className="text-gray-500 mt-2 mb-6">Số dư xu của bạn đã được cập nhật.</p>
            <Link
                href="/dashboard/coins"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
                Kiểm tra ví ngay
            </Link>
        </div>
    )
}

export default function TopupSuccessPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <Suspense fallback={<div className="text-center py-12">Đang tải...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    )
}
