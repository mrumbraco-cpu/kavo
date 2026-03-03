import PublicNavbar from '@/components/public/PublicNavbar';
import { SearchProvider } from '@/lib/context/SearchContext';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const FooterWrapper = dynamic(() => import('./FooterWrapper').then(mod => mod.FooterWrapper), {
    ssr: true,
});

import NavAuthWrapper from '@/components/public/NavAuthWrapper';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SearchProvider>
            <div className="flex flex-col min-h-screen">
                <PublicNavbar
                    navActions={
                        <NavAuthWrapper />
                    }
                />
                <main className="flex-1 pt-16 flex flex-col">
                    {children}
                </main>
                <FooterWrapper />
            </div>
        </SearchProvider>
    );
}

