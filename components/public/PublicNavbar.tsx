'use client';

import Link from 'next/link';
import PublicNavbarActions from './PublicNavbarActions';
import HeaderSearch from './HeaderSearch';
import SearchModal from './SearchModal';
import BrandLogo from './BrandLogo';

interface PublicNavbarProps {
    user: any;
    profile: any;
}

export default function PublicNavbar({ user, profile }: PublicNavbarProps) {

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-premium-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <BrandLogo />

                            {/* Desktop Search Display */}
                            <HeaderSearch />
                        </div>

                        {/* Nav Links & Actions */}
                        <div className="flex items-center gap-6">
                            {/* Auth Actions */}
                            <PublicNavbarActions user={user} profile={profile} />
                        </div>
                    </div>
                </div>
            </header>
            <SearchModal />
        </>
    );
}
