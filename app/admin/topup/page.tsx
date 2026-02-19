import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Profile } from '@/types/profile';
import TopupForm from '@/components/admin/TopupForm';

export default async function AdminTopupPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createServerSupabaseClient();
    const resolvedParams = await searchParams;
    const initialUserId = resolvedParams.userId as string | undefined;

    // MANDATORY ROLE GUARD
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if ((profile as Profile)?.role !== 'admin') {
        redirect('/');
    }

    // Fetch all users using service role (bypasses RLS)
    // This is safe because we verified admin role above
    const serviceSupabase = createServiceRoleClient();
    const { data: users } = await serviceSupabase
        .from('profiles')
        .select('id, email, coin_balance')
        .order('email', { ascending: true });

    const typedUsers = (users || []) as Pick<Profile, 'id' | 'email' | 'coin_balance'>[];


    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Topup xu cho ví người dùng</h1>
                <p className="text-sm text-gray-600 mt-1">Nạp xu hoặc điều chỉnh số dư ví người dùng</p>
            </div>

            <TopupForm users={typedUsers} initialUserId={initialUserId} />
        </div>
    );
}
