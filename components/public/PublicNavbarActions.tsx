'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

interface Props {
    user: { id: string; email?: string } | null;
    profile: { role: string; coin_balance: number } | null;
}

export default function PublicNavbarActions({ user, profile }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleLogout = async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        router.refresh();
    };

    const isListingDetail = pathname.startsWith('/listings/');
    const isSearchPage = pathname === '/search';

    if (!user) {
        if (isListingDetail) return null;

        // Only set 'next' if we're not on the home page, so home page login goes to dashboard
        const nextParam = pathname !== '/'
            ? `?next=${encodeURIComponent(pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''))}`
            : '';

        return (
            <div className="flex items-center gap-4">
                {isSearchPage && (
                    <div className="relative group/post">
                        {/* Floating badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg whitespace-nowrap z-10 animate-bounce border border-white pointer-events-none">
                            Thưởng 10 xu
                        </div>
                        <Link
                            href={`/auth/login?next=${encodeURIComponent('/dashboard/listings/new')}`}
                            className="px-5 py-2 bg-premium-900 text-white text-sm font-semibold rounded-full hover:bg-premium-800 transition-all hover:shadow-md active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Đăng tin
                        </Link>
                    </div>
                )}
                <Link
                    href={`/auth/login${nextParam}`}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Đăng nhập
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {isSearchPage && (
                <div className="relative group/post">
                    {/* Floating badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg whitespace-nowrap z-10 animate-bounce border border-white pointer-events-none">
                        Thưởng 10 xu
                    </div>
                    <Link
                        href="/dashboard/listings/new"
                        className="px-5 py-2 bg-premium-900 text-white text-sm font-semibold rounded-full hover:bg-premium-800 transition-all hover:shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Đăng tin
                    </Link>
                </div>
            )}
            {/* User dropdown */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-premium-50 transition-colors cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-premium-900 flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase">
                            {user.email?.[0] ?? 'U'}
                        </span>
                    </div>
                    <svg className="w-4 h-4 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-premium-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {profile?.role === 'admin' && (
                        <>
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Quản trị hệ thống
                            </Link>
                            <hr className="my-1 border-premium-100" />
                        </>
                    )}

                    {/* 1. Tài khoản xu */}
                    <Link
                        href="/dashboard/coins"
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tài khoản xu
                        </div>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded leading-none">
                            {profile?.coin_balance ?? 0}
                        </span>
                    </Link>

                    {/* 2. Danh sách tin đăng */}
                    <Link
                        href="/dashboard/listings"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Danh sách tin đăng
                    </Link>

                    {/* 3. Tin đã lưu */}
                    <Link
                        href="/dashboard/favorites"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Tin đã lưu
                    </Link>

                    {/* 4. Khóa liên hệ đã mở */}
                    <Link
                        href="/dashboard/unlocked-listings"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        Khóa liên hệ đã mở
                    </Link>

                    {/* 5. Cập nhật tài khoản */}
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
}
