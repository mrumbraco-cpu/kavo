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
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-slate-900 tracking-tight">
                                    SpaceShare
                                </span>
                            </Link>
                        </div>

                        {/* Nav Links & Actions */}
                        <div className="flex items-center gap-6">
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
