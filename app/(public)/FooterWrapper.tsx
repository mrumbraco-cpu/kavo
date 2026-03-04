'use client';

import { usePathname } from 'next/navigation';
import PublicFooter from '@/components/public/PublicFooter';

export function FooterWrapper() {
    const pathname = usePathname();

    // On search page, the footer is rendered internally within the scrollable list on desktop.
    // We do not render the main app layout footer here to prevent double scrollbars.
    if (pathname === '/search') {
        return null;
    }

    return <PublicFooter />;
}
