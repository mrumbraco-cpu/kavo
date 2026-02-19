'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    // We could use order_id to log specific error if needed

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Giao dịch thất bại</h2>
            <p className="text-red-500 mt-2 mb-6">Đã có lỗi xảy ra trong quá trình thanh toán.</p>
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

export default function TopupErrorPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <Suspense fallback={<div>Đang tải...</div>}>
                    <ErrorContent />
                </Suspense>
            </div>
        </div>
    )
}
