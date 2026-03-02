import { createServerSupabaseClient } from '@/lib/supabase/server';
import PublicNavbarActions from './PublicNavbarActions';

/**
 * NavAuth: Async Server Component — self-contained auth fetch.
 * Được wrap trong <Suspense> tại layout để HTML streaming bắt đầu ngay.
 * Supabase auth query chạy song song với việc server stream các phần khác của page.
 */
export default async function NavAuth() {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    const profile = user
        ? (await supabase
            .from('profiles')
            .select('role, coin_balance')
            .eq('id', user.id)
            .single()).data
        : null;

    return <PublicNavbarActions user={user} profile={profile} />;
}
