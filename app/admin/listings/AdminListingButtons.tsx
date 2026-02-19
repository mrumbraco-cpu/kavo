'use client';

import { approveListing, toggleVisibility, toggleLock, toggleExpired } from './actions';
import { useState } from 'react';
import Link from 'next/link';

interface AdminListingButtonsProps {
    id: string;
    status: string;
    isHidden: boolean;
    isLocked: boolean;
}

export default function AdminListingButtons({ id, status, isHidden, isLocked }: AdminListingButtonsProps) {
    const [isPending, setIsPending] = useState(false);

    const handleApprove = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt tin đăng này?')) return;
        setIsPending(true);
        await approveListing(id);
        setIsPending(false);
    };

    const handleToggleVisibility = async () => {
        setIsPending(true);
        await toggleVisibility(id, isHidden);
        setIsPending(false);
    };

    const handleToggleLock = async () => {
        const action = isLocked ? 'mở khóa soạn' : 'khóa soạn';
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tin đăng này?`)) return;
        setIsPending(true);
        await toggleLock(id, isLocked);
        setIsPending(false);
    };

    const handleToggleExpired = async () => {
        const action = status === 'expired' ? 'bỏ hết hạn' : 'đánh dấu hết hạn';
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} tin đăng này?`)) return;
        setIsPending(true);
        await toggleExpired(id, status);
        setIsPending(false);
    };

    if (status === 'draft') return null;

    return (
        <div className="flex items-center gap-1.5 justify-end flex-nowrap">
            <Link
                href={`/admin/listings/${id}/edit?from=admin`}
                className="whitespace-nowrap px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 text-[11px] font-bold transition-all shadow-sm"
            >
                Sửa
            </Link>

            {status === 'pending' && (
                <button
                    onClick={handleApprove}
                    disabled={isPending}
                    className="whitespace-nowrap px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-[11px] font-bold transition-all shadow-sm shadow-green-100"
                >
                    Duyệt
                </button>
            )}

            <button
                onClick={handleToggleExpired}
                disabled={isPending}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition-all shadow-sm ${status === 'expired'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-100'
                    }`}
            >
                {status === 'expired' ? 'Bỏ hết hạn' : 'Hết hạn'}
            </button>

            <button
                onClick={handleToggleVisibility}
                disabled={isPending}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition-all shadow-sm ${isHidden
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                    : 'bg-slate-500 hover:bg-slate-600 shadow-slate-100'
                    }`}
            >
                {isHidden ? 'Hiện tin' : 'Ẩn tin'}
            </button>

            <button
                onClick={handleToggleLock}
                disabled={isPending}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition-all shadow-sm ${isLocked
                    ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'
                    : 'bg-slate-800 hover:bg-slate-900 shadow-slate-200'
                    }`}
            >
                {isLocked ? 'Mở khóa soạn' : 'Khóa soạn'}
            </button>
        </div>
    );
}
