'use client';

import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

interface UserDropdownProps {
    user: { email?: string };
    profile: { role: string; coin_balance: number } | null;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function UserDropdown({ user, profile, isOpen, onClose }: UserDropdownProps) {
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                console.error('Logout API failed, falling back to client signout');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Ensure client state is cleared and full reload happens
            const supabase = createBrowserSupabaseClient();
            await supabase.auth.signOut();
            window.location.reload();
        }
    };

    if (isOpen === false) return null;

    return (
        <div className={`absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-premium-100 py-1 transition-all duration-200 z-50 ${isOpen !== undefined ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
            {profile?.role === 'admin' && (
                <>
                    <Link
                        href="/admin"
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Quản trị hệ thống
                    </Link>
                    <hr className="my-1 border-premium-100" />
                </>
            )}

            <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-premium-900 hover:bg-premium-50 transition-colors"
            >
                <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Trang tổng quan
            </Link>

            <hr className="my-1 border-premium-100" />

            <Link
                href="/dashboard/coins"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <svg className="w-3 h-3" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                        </svg>
                    </div>
                    Tài khoản xu
                </div>
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-md leading-none shadow-sm shadow-amber-200">
                    {profile?.coin_balance ?? 0}
                </span>
            </Link>

            <Link
                href="/dashboard/listings"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
            >
                <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Danh sách tin đăng
            </Link>

            <Link
                href="/dashboard/favorites"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
            >
                <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Tin đã lưu
            </Link>

            <Link
                href="/dashboard/unlocked-listings"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
            >
                <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Khóa liên hệ đã mở
            </Link>

            <Link
                href="/dashboard/profile"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
            >
                <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cập nhật tài khoản
            </Link>

            <hr className="my-1 border-premium-100" />
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
                <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
            </button>
        </div>
    );
}
