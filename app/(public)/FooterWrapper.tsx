'use client';

import { usePathname } from 'next/navigation';
import PublicFooter from '@/components/public/PublicFooter';

export function FooterWrapper() {
    const pathname = usePathname();

    // On search page, we only hide footer on mobile
    // to prevent double scrollbars and maintain the app-like feel.
    // Desktop layout (lg and up) will still show it.
    if (pathname === '/search') {
        return (
            <div className="hidden lg:block">
                <PublicFooter />
            </div>
        );
    }

    return <PublicFooter />;
}
