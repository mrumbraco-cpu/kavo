import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import PublicNavbarActions from './PublicNavbarActions';
import HeaderSearch from './HeaderSearch';
import NavbarLinks from './NavbarLinks';
import SearchModal from './SearchModal';

export default async function PublicNavbar() {
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
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-premium-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 bg-premium-900 rounded-lg rotate-45 flex items-center justify-center transition-transform group-hover:rotate-[50deg]">
                                <span className="text-white text-sm font-bold -rotate-45">S</span>
                            </div>
                            <span className="text-lg font-black text-premium-900 tracking-tighter uppercase">
                                SPSHARE
                            </span>
                        </Link>

                        {/* Desktop Search Display */}
                        <HeaderSearch />

                        {/* Nav Links & Actions */}
                        <div className="flex items-center gap-6">
                            <NavbarLinks user={user} />

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
