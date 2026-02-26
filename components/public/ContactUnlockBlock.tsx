'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { unlockContactAction } from '@/app/(public)/listings/[slug]/actions';

interface Props {
    listingId: string;
    isAuthenticated: boolean;
    alreadyUnlocked: boolean;
    initialPhone?: string;
    initialZalo?: string;
    coinBalance: number;
    canUnlock: boolean;
}

const UNLOCK_COST = 10;

export default function ContactUnlockBlock({
    listingId,
    isAuthenticated,
    alreadyUnlocked,
    initialPhone,
    initialZalo,
    coinBalance,
    canUnlock,
}: Props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [state, setState] = useState<'locked' | 'unlocked' | 'loading' | 'error'>(
        alreadyUnlocked ? 'unlocked' : 'locked'
    );
    const [contact, setContact] = useState<{ phone?: string; zalo?: string }>({
        phone: initialPhone,
        zalo: initialZalo,
    });
    const [errorMsg, setErrorMsg] = useState('');

    const handleUnlock = async () => {
        setState('loading');
        setErrorMsg('');
        const result = await unlockContactAction(listingId);
        if (!result.success) {
            setState('error');
            setErrorMsg(result.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
            return;
        }
        setContact({ phone: result.data?.phone, zalo: result.data?.zalo });
        setState('unlocked');
    };

    const callbackUrl = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');

    // ── Not authenticated ───────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">Thông tin liên hệ</p>
                        <p className="text-xs text-gray-400">Đăng nhập để tiếp tục</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-4 mb-5 leading-relaxed">
                    Đăng nhập để xem số điện thoại và Zalo của chủ không gian.
                </p>

                <a
                    href={`/auth/login?next=${encodeURIComponent(callbackUrl)}`}
                    className="block w-full py-3 bg-gray-900 text-white text-sm font-semibold text-center rounded-xl hover:bg-gray-800 transition-colors"
                >
                    Đăng nhập
                </a>
                <a
                    href={`/auth/register?next=${encodeURIComponent(callbackUrl)}`}
                    className="block w-full mt-3 py-3 border border-gray-200 text-gray-700 text-sm font-medium text-center rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                    Tạo tài khoản mới
                </a>
            </div>
        );
    }

    // ── Already unlocked ────────────────────────────────────────────────
    if (state === 'unlocked') {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">Thông tin liên hệ</p>
                </div>

                <div className="flex flex-col gap-3">
                    {contact.phone && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 mb-0.5">Điện thoại</p>
                                <a href={`tel:${contact.phone}`} className="font-semibold text-gray-900 hover:underline text-sm">{contact.phone}</a>
                            </div>
                        </div>
                    )}
                    {contact.zalo && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.254 2 11.5c0 3.083 1.536 5.825 3.924 7.57L5 22l3.13-1.38A10.34 10.34 0 0012 21c5.523 0 10-4.254 10-9.5S17.523 2 12 2zm5.07 12.86c-.21.59-1.23 1.14-1.7 1.18-.44.04-.45.34-2.82-.59-2.41-.95-3.95-3.26-4.07-3.41-.12-.15-.97-1.28-.97-2.45 0-1.17.61-1.74.83-1.98.22-.24.48-.3.64-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.2.48.68 1.66.74 1.78.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.11-.24.23-.1.46.14.23.62.99 1.33 1.61.91.8 1.68 1.05 1.92 1.17.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.15 1.17z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 mb-0.5">Zalo</p>
                                <a
                                    href={`https://zalo.me/${contact.zalo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-gray-900 hover:underline text-sm"
                                >
                                    {contact.zalo}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                    Thỏa thuận giá cả và lịch sử dụng diễn ra trực tiếp với chủ không gian.
                </p>
            </div>
        );
    }

    // ── Locked ──────────────────────────────────────────────────────────
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">Thông tin liên hệ</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Mở khóa để liên hệ trực tiếp với chủ không gian.
            </p>

            {/* Coin balance */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-xl mb-4 border border-amber-100">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                    </svg>
                    <span className="text-sm text-amber-700">Số dư của bạn</span>
                </div>
                <span className="font-bold text-amber-800">{coinBalance} xu</span>
            </div>

            {state === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errorMsg}
                </div>
            )}

            {canUnlock ? (
                <button
                    onClick={handleUnlock}
                    disabled={state === 'loading'}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                    {state === 'loading' ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Mở khóa · {UNLOCK_COST} xu
                        </>
                    )}
                </button>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
                        Cần tối thiểu <strong>{UNLOCK_COST} xu</strong> để mở khóa. Hiện tại bạn có <strong>{coinBalance} xu</strong>.
                    </p>
                    <a
                        href={`/dashboard/coins/topup?next=${encodeURIComponent(callbackUrl)}`}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 text-white rounded-xl font-semibold text-center hover:bg-amber-600 transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                        </svg>
                        Nạp xu ngay
                    </a>
                </div>
            )}
        </div>
    );
}
