import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { SearchProvider } from '@/lib/context/SearchContext';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SearchProvider>
            <PublicNavbar />
            <main className="pt-16 min-h-screen">
                {children}
            </main>
            <PublicFooter />
        </SearchProvider>
    );
}
