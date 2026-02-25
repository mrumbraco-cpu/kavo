'use client'

import { useState } from 'react'
import { AlertCircle, RotateCcw, Loader2 } from 'lucide-react'
import { toggleListingExpiration } from './actions'

interface ExpirationToggleProps {
    listingId: string
    status: 'approved' | 'expired'
}

export default function ExpirationToggle({ listingId, status }: ExpirationToggleProps) {
    const [isLoading, setIsLoading] = useState(false)
    const isExpired = status === 'expired'

    const handleToggle = async () => {
        if (isLoading) return

        const confirmMessage = isExpired
            ? 'Bạn muốn khôi phục (Bỏ hết hạn) tin đăng này? Nó sẽ xuất hiện lại trong kết quả tìm kiếm.'
            : 'Bạn muốn đánh dấu tin đăng này là Đã hết hạn? Nó sẽ không còn xuất hiện trong kết quả tìm kiếm.'

        if (!confirm(confirmMessage)) return

        setIsLoading(true)
        try {
            const result = await toggleListingExpiration(listingId)
            if (!result.success) {
                alert(result.error || 'Có lỗi xảy ra, vui lòng thử lại sau.')
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`h-9 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm ${isExpired
                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white border-emerald-100'
                : 'text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border-rose-100'
                } disabled:opacity-50`}
            title={isExpired ? 'Nhấp để khôi phục (Bỏ hết hạn)' : 'Nhấp để đánh dấu Hết hạn'}
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isExpired ? (
                <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Khôi phục</span>
                </>
            ) : (
                <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Hết hạn</span>
                </>
            )}
        </button>
    )
}
