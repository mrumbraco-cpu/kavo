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

    if (!user) {
        if (isListingDetail) return null;

        // Only set 'next' if we're not on the home page, so home page login goes to dashboard
        const nextParam = pathname !== '/'
            ? `?next=${encodeURIComponent(pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''))}`
            : '';

        return (
            <div className="flex items-center gap-3">
                <Link
                    href={`/auth/login${nextParam}`}
                    className="text-sm font-medium text-premium-700 hover:text-premium-900 transition-colors"
                >
                    Đăng nhập
                </Link>
                <Link
                    href={`/auth/register${nextParam}`}
                    className="px-4 py-2 bg-premium-900 text-white text-sm font-medium rounded-full hover:bg-premium-800 transition-colors"
                >
                    Đăng ký
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {/* Coin balance */}
            {profile && (
                <Link
                    href="/dashboard/wallet"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                >
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" />
                        <text x="10" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">₫</text>
                    </svg>
                    <span className="text-sm font-semibold text-amber-700">{profile.coin_balance}</span>
                </Link>
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
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-premium-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {profile?.role === 'admin' && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Quản trị
                        </Link>
                    )}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/listings"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Listings của tôi
                    </Link>
                    <Link
                        href="/dashboard/wallet"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-premium-600 hover:bg-premium-50 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Ví xu
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
