import PublicNavbar from '@/components/public/PublicNavbar';
import { SearchProvider } from '@/lib/context/SearchContext';
import { Suspense } from 'react';
import NavAuth from '@/components/public/NavAuth';
import dynamic from 'next/dynamic';

const FooterWrapper = dynamic(() => import('./FooterWrapper').then(mod => mod.FooterWrapper), {
    ssr: true,
});

/** Skeleton nhỏ cho auth buttons — render ngay khi HTML stream */
function NavAuthSkeleton() {
    return (
        <div className="flex items-center gap-4" aria-hidden="true">
            <div className="h-9 w-20 bg-premium-100 rounded-xl animate-pulse" />
        </div>
    );
}

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
                        <Suspense fallback={<NavAuthSkeleton />}>
                            <NavAuth />
                        </Suspense>
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

