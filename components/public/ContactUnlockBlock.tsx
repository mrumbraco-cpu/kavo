'use client';

import { useState } from 'react';
import { unlockContactAction } from '@/app/(public)/listings/[id]/actions';

interface Props {
    listingId: string;
    isAuthenticated: boolean;
    alreadyUnlocked: boolean;
    initialPhone?: string;   // Only present if already unlocked
    initialZalo?: string;    // Only present if already unlocked
    coinBalance: number;
    canUnlock: boolean;      // Has enough coins or active subscription
}

const UNLOCK_COST = 10; // Hardcoded, matches unlock_listing_contact RPC

export default function ContactUnlockBlock({
    listingId,
    isAuthenticated,
    alreadyUnlocked,
    initialPhone,
    initialZalo,
    coinBalance,
    canUnlock,
}: Props) {
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

        setContact({
            phone: result.data?.phone,
            zalo: result.data?.zalo,
        });
        setState('unlocked');
    };

    // State 1: Not authenticated
    if (!isAuthenticated) {
        return (
            <div className="rounded-2xl border border-premium-200 bg-premium-50 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-premium-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-premium-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-premium-900 mb-1">Thông tin liên hệ</h3>
                        <p className="text-sm text-premium-500 mb-4">Đăng nhập để xem thông tin liên hệ của chủ không gian này.</p>
                        <div className="flex gap-3">
                            <a href="/auth/login" className="px-4 py-2 bg-premium-900 text-white text-sm font-medium rounded-full hover:bg-premium-800 transition-colors">
                                Đăng nhập
                            </a>
                            <a href="/auth/register" className="px-4 py-2 bg-white text-premium-700 border border-premium-200 text-sm font-medium rounded-full hover:border-premium-400 transition-colors">
                                Đăng ký
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // State 2: Already unlocked — show contact
    if (state === 'unlocked') {
        return (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-green-800">Thông tin liên hệ đã được mở khóa</h3>
                </div>
                <div className="flex flex-col gap-3">
                    {contact.phone && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-100">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-premium-500">Điện thoại</p>
                                <a href={`tel:${contact.phone}`} className="font-semibold text-premium-900 hover:underline">{contact.phone}</a>
                            </div>
                        </div>
                    )}
                    {contact.zalo && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-100">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xs">Z</span>
                            </div>
                            <div>
                                <p className="text-xs text-premium-500">Zalo</p>
                                <a
                                    href={`https://zalo.me/${contact.zalo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-premium-900 hover:underline"
                                >
                                    {contact.zalo}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                <p className="mt-4 text-xs text-premium-400">
                    Mọi thỏa thuận về giá và lịch sử dụng diễn ra trực tiếp với chủ không gian.
                </p>
            </div>
        );
    }

    // State 3: Locked — can unlock or not enough coins
    return (
        <div className="rounded-2xl border border-premium-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-premium-900 mb-2">Thông tin liên hệ</h3>
            <p className="text-sm text-premium-500 mb-5">
                Mở khóa để xem số điện thoại và Zalo của chủ không gian. Thỏa thuận trực tiếp hoàn toàn.
            </p>

            {/* Coin balance info */}
            <div className="flex items-center justify-between p-3 bg-premium-50 rounded-xl mb-4 border border-premium-100">
                <div className="flex items-center gap-2">
                    <span className="text-amber-600 text-lg">🪙</span>
                    <span className="text-sm text-premium-600">Số dư của bạn</span>
                </div>
                <span className="font-bold text-premium-900">{coinBalance} xu</span>
            </div>

            {state === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {errorMsg}
                </div>
            )}

            {canUnlock ? (
                <button
                    onClick={handleUnlock}
                    disabled={state === 'loading'}
                    className="w-full py-3 bg-premium-900 text-white rounded-xl font-semibold hover:bg-premium-800 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            Mở khóa – {UNLOCK_COST} xu
                        </>
                    )}
                </button>
            ) : (
                <div className="space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                        Bạn cần tối thiểu {UNLOCK_COST} xu để mở khóa. Hiện tại: {coinBalance} xu.
                    </div>
                    <a
                        href="/dashboard/wallet"
                        className="block w-full py-3 bg-accent-gold text-premium-950 rounded-xl font-semibold text-center hover:bg-yellow-500 transition-colors"
                    >
                        🪙 Nạp xu ngay
                    </a>
                </div>
            )}
        </div>
    );
}
