import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { SearchProvider } from '@/lib/context/SearchContext';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    const profile = user ? (await supabase
        .from('profiles')
        .select('role, coin_balance')
        .eq('id', user.id)
        .single()).data : null;

    return (
        <SearchProvider>
            <div className="flex flex-col min-h-screen">
                <PublicNavbar user={user} profile={profile} />
                <main className="flex-1 pt-16 flex flex-col">
                    {children}
                </main>
                <FooterWrapper />
            </div>
        </SearchProvider>
    );
}

// Separate client component to handle conditional footer
import { FooterWrapper } from './FooterWrapper';
