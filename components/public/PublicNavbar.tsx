'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import BrandLogo from './BrandLogo';
import type { ReactNode } from 'react';
import NavSearchWrapper from './NavSearchWrapper';

interface PublicNavbarProps {
    navActions: ReactNode;
}

export default function PublicNavbar({ navActions }: PublicNavbarProps) {
    const pathname = usePathname();
    const isSearchPage = pathname === '/search';
    const isListingDetail = pathname.startsWith('/listings/');

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabase.auth.onAuthStateChange((event, session) => {
            setIsLoggedIn(!!session?.user);
        });
        // Initial check
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsLoggedIn(!!user);
        });
    }, []);

    // Hide text on mobile for:
    // 1. Search page (both guest and user)
    // 2. Listing detail (only when logged in - because guest has fewer buttons)
    const shouldHideTextOnMobile = isSearchPage || (isListingDetail && isLoggedIn);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-premium-100/50">
            {/* Background layer for glass effect - Separate to avoid creating a containing block for SearchModal */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md sm:backdrop-blur-xl -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <BrandLogo hideTextOnMobile={shouldHideTextOnMobile} />

                        {/* Desktop Search Display Wrapper */}
                        <NavSearchWrapper />
                    </div>

                    {/* Nav Links & Actions */}
                    <div className="flex items-center gap-6">
                        {navActions}
                    </div>
                </div>
            </div>
        </header>
    );
}
