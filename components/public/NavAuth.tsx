'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import PublicNavbarActions from './PublicNavbarActions';

/**
 * NavAuth: Client Component — self-contained auth fetch.
 * Changed to Client Component to prevent full-page dynamic rendering.
 * This ensures bfcache works correctly and pages can be statically cached.
 */
export default function NavAuth() {
    const [user, setUser] = useState<any>(undefined);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user || null);

                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('role, coin_balance')
                        .eq('id', user.id)
                        .single();
                    setProfile(data);
                }
            } catch (err) {
                console.error('NavAuth Error:', err);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    // Skeleton loading state
    if (user === undefined) {
        return (
            <div className="flex items-center gap-4" aria-hidden="true">
                <div className="h-9 w-20 bg-premium-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    return <PublicNavbarActions user={user} profile={profile} />;
}
