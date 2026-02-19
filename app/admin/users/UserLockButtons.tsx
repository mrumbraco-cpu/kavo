'use client'

import { useState } from 'react'
import { LockStatus } from '@/types/profile'
import { updateUserLockStatus } from './actions'
import { Lock, Unlock, ShieldAlert, Loader2 } from 'lucide-react'

interface UserLockButtonsProps {
    userId: string
    currentStatus: LockStatus
    userEmail: string
}

export default function UserLockButtons({ userId, currentStatus, userEmail }: UserLockButtonsProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdateStatus = async (newStatus: LockStatus) => {
        if (newStatus === currentStatus) return

        let confirmMessage = ''
        if (newStatus === 'soft') confirmMessage = `Bạn có chắc muốn KHÓA MỀM người dùng ${userEmail}? Người dùng sẽ không thể đăng hoặc sửa bài.`
        if (newStatus === 'hard') confirmMessage = `Bạn có chắc muốn KHÓA CỨNG người dùng ${userEmail}? Người dùng sẽ bị đăng xuất ngay lập tức và không thể đăng nhập lại.`
        if (newStatus === 'none') confirmMessage = `Bạn có chắc muốn MỞ KHÓA người dùng ${userEmail}?`

        if (!window.confirm(confirmMessage)) return

        setIsLoading(true)
        try {
            const result = await updateUserLockStatus({ userId, status: newStatus })
            if (result.success) {
                window.alert(result.message)
            } else {
                window.alert('Lỗi: ' + result.error)
            }
        } catch (error) {
            window.alert('Có lỗi xảy ra khi cập nhật trạng thái')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
            </div>
        )
    }

    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {currentStatus !== 'none' && (
                <button
                    onClick={() => handleUpdateStatus('none')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors border border-green-200"
                >
                    <Unlock className="w-3.5 h-3.5" />
                    Mở khóa
                </button>
            )}

            {currentStatus !== 'soft' && (
                <button
                    onClick={() => handleUpdateStatus('soft')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors border border-amber-200"
                >
                    <Lock className="w-3.5 h-3.5" />
                    Khóa mềm
                </button>
            )}

            {currentStatus !== 'hard' && (
                <button
                    onClick={() => handleUpdateStatus('hard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Khóa cứng
                </button>
            )}
        </div>
    )
}
