'use client';

import { useState } from 'react';
import { updateReportStatus } from './actions';
import { toggleVisibility, toggleLock } from '../listings/actions';
import { CheckCircle2, XCircle, EyeOff, Lock, Eye, Unlock } from 'lucide-react';

interface AdminReportButtonsProps {
    reportId: string;
    reportStatus: string;
    listingId: string;
    listingIsHidden: boolean;
    listingIsLocked: boolean;
}

export default function AdminReportButtons({
    reportId,
    reportStatus,
    listingId,
    listingIsHidden,
    listingIsLocked
}: AdminReportButtonsProps) {
    const [isPending, setIsPending] = useState(false);

    const handleUpdateStatus = async (status: 'resolved' | 'ignored') => {
        const actionText = status === 'resolved' ? 'xử lý' : 'bỏ qua';
        if (!window.confirm(`Xác nhận ${actionText} báo cáo này?`)) return;

        setIsPending(true);
        const result = await updateReportStatus(reportId, status);
        if (!result.success) {
            alert('Lỗi: ' + result.error);
        }
        setIsPending(false);
    };

    const handleToggleVisibility = async () => {
        setIsPending(true);
        const success = await toggleVisibility(listingId, listingIsHidden);
        if (!success) alert('Lỗi khi thay đổi trạng thái ẩn hiện tin');
        setIsPending(false);
    };

    const handleToggleLock = async () => {
        setIsPending(true);
        const success = await toggleLock(listingId, listingIsLocked);
        if (!success) alert('Lỗi khi thay đổi trạng thái khóa tin');
        setIsPending(false);
    };

    if (reportStatus !== 'pending') {
        return (
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${reportStatus === 'resolved' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}>
                    {reportStatus === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua'}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Quick Listing Actions */}
            <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100 gap-1">
                <button
                    onClick={handleToggleVisibility}
                    disabled={isPending}
                    title={listingIsHidden ? "Hiện tin đăng" : "Ẩn tin đăng"}
                    className={`p-1.5 rounded-md transition-all ${listingIsHidden
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {listingIsHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                    onClick={handleToggleLock}
                    disabled={isPending}
                    title={listingIsLocked ? "Mở khóa soạn" : "Khóa soạn tin"}
                    className={`p-1.5 rounded-md transition-all ${listingIsLocked
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {listingIsLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            {/* Report Resolution Actions */}
            <button
                onClick={() => handleUpdateStatus('resolved')}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-[11px] font-bold transition-all"
            >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Giải quyết
            </button>
            <button
                onClick={() => handleUpdateStatus('ignored')}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-[11px] font-bold transition-all"
            >
                <XCircle className="w-3.5 h-3.5" />
                Bỏ qua
            </button>
        </div>
    );
}
