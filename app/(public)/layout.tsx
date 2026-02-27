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

    // Fetch user and profile in parallel if possible
    // Note: auth.getUser() must happen before we know the ID for the profile query
    // But we can start the profile check once we have the user
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
