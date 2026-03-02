import BrandLogo from './BrandLogo';
import type { ReactNode } from 'react';
import NavSearchWrapper from './NavSearchWrapper';

interface PublicNavbarProps {
    navActions: ReactNode;
}

export default function PublicNavbar({ navActions }: PublicNavbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-premium-100/50">
            {/* Background layer for glass effect - Separate to avoid creating a containing block for SearchModal */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md sm:backdrop-blur-xl -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <BrandLogo />

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
