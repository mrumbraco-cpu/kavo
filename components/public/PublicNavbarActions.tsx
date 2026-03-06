'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const UserDropdown = dynamic(() => import('./UserDropdown'), {
    ssr: false,
});

interface Props {
    user: { id: string; email?: string } | null;
    profile: { role: string; coin_balance: number } | null;
}

export default function PublicNavbarActions({ user, profile }: Props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isListingDetail = pathname.startsWith('/listings/');
    const isSearchPage = pathname === '/search';
    const showPostButton = isSearchPage || isListingDetail;

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!user) {
        // Only set 'next' if we're not on the home page, so home page login goes to dashboard
        const nextParam = pathname !== '/'
            ? `?next=${encodeURIComponent(pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''))}`
            : '';

        return (
            <div className="flex items-center gap-4">
                {showPostButton && (
                    <div className="relative group/post">
                        {/* Floating reward badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent-gold text-white text-[10px] font-bold rounded-full shadow-lg shadow-accent-gold/20 whitespace-nowrap z-10 animate-premium-float border border-white pointer-events-none uppercase tracking-wider">
                            +10 xu
                        </div>
                        <Link
                            href={`/auth/login?next=${encodeURIComponent('/dashboard/listings/new')}`}
                            className="px-6 py-2.5 bg-premium-900 text-white text-sm font-bold rounded-xl hover:bg-premium-800 transition-all hover:shadow-xl hover:shadow-premium-900/10 active:scale-95 flex items-center gap-2 group/btn"
                        >
                            <svg className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Đăng tin
                        </Link>
                    </div>
                )}
                {!isListingDetail && (
                    <Link
                        href={`/auth/login${nextParam}`}
                        className="flex items-center gap-2 px-5 py-2.5 border border-premium-200 rounded-xl text-sm font-bold text-premium-700 hover:bg-premium-50 hover:border-premium-300 transition-all active:scale-95"
                    >
                        Đăng nhập
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {showPostButton && (
                <div className="relative group/post">
                    {/* Floating reward badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent-gold text-white text-[10px] font-bold rounded-full shadow-lg shadow-accent-gold/20 whitespace-nowrap z-10 animate-premium-float border border-white pointer-events-none uppercase tracking-wider">
                        +10 xu
                    </div>
                    <Link
                        href="/dashboard/listings/new"
                        className="px-6 py-2.5 bg-premium-900 text-white text-sm font-bold rounded-xl hover:bg-premium-800 transition-all hover:shadow-xl hover:shadow-premium-900/10 active:scale-95 flex items-center gap-2 group/btn"
                    >
                        <svg className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Đăng tin
                    </Link>
                </div>
            )}
            {/* User dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-premium-50 transition-colors cursor-pointer"
                    aria-label="Menu người dùng"
                    aria-expanded={isOpen}
                >
                    <div className="w-7 h-7 rounded-full bg-premium-900 flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase">
                            {user.email?.[0] ?? 'U'}
                        </span>
                    </div>
                    <svg className={`w-4 h-4 text-premium-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown - Dynamically loaded */}
                <UserDropdown user={user} profile={profile} isOpen={isOpen} onClose={() => setIsOpen(false)} />
            </div>
        </div>
    );
}
