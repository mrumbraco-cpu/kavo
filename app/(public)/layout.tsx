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

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('role, coin_balance')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <SearchProvider>
            <PublicNavbar user={user} profile={profile} />
            <main className="pt-16 min-h-screen">
                {children}
            </main>
            <PublicFooter />
        </SearchProvider>
    );
}
