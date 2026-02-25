'use client'

import { useState } from 'react'
import { EyeOff, Eye, Loader2 } from 'lucide-react'
import { toggleListingVisibility } from './actions'

interface VisibilityToggleProps {
    listingId: string
    isHidden: boolean
}

export default function VisibilityToggle({ listingId, isHidden }: VisibilityToggleProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        if (isLoading) return

        const confirmMessage = isHidden
            ? 'Bạn muốn hiển thị lại tin đăng này ngay lập tức?'
            : 'Bạn có chắc chắn muốn tạm ẩn tin đăng này? Nó sẽ không còn xuất hiện trong kết quả tìm kiếm.'

        if (!confirm(confirmMessage)) return

        setIsLoading(true)
        try {
            const result = await toggleListingVisibility(listingId)
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
            className={`h-9 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm ${isHidden
                ? 'text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border-red-100'
                : 'text-slate-600 bg-slate-50 hover:bg-slate-900 hover:text-white border-slate-100'
                } disabled:opacity-50`}
            title={isHidden ? 'Nhấp để hiển thị lại' : 'Nhấp để tạm ẩn tin'}
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isHidden ? (
                <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Hiện tin</span>
                </>
            ) : (
                <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Ẩn tin</span>
                </>
            )}
        </button>
    )
}
