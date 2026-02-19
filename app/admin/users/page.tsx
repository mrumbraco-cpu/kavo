import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Profile } from '@/types/profile';
import Link from 'next/link';
import { User, Mail, Coins, Calendar, Shield, Lock, ShieldAlert, Phone, MessageSquare, TrendingUp } from 'lucide-react';
import UserLockButtons from './UserLockButtons';
import UserFilters from './UserFilters';

const PAGE_SIZE = 20;

interface AdminUsersPageProps {
    searchParams: Promise<{
        page?: string;
        role?: string;
        email?: string;
        phone?: string;
        date_from?: string;
        date_to?: string;
        min_balance?: string;
        lock_status?: string;
    }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
    const supabase = await createServerSupabaseClient();
    const params = await searchParams;

    const page = parseInt(params.page || '1', 10) || 1;
    const roleFilter = params.role || 'all';
    const email = params.email;
    const phone = params.phone;
    const dateFrom = params.date_from;
    const dateTo = params.date_to;
    const minBalance = params.min_balance;
    const lockStatusValue = params.lock_status || 'all';

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

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

    const serviceSupabase = createServiceRoleClient();

    // 1. MAIN QUERY - Simplified to avoid join errors
    let query = serviceSupabase
        .from('profiles')
        .select('*', { count: 'exact' });

    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    if (email) query = query.ilike('email', `%${email}%`);
    if (phone) query = query.or(`phone.ilike.%${phone}%,zalo.ilike.%${phone}%`);
    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
    if (minBalance && !isNaN(parseInt(minBalance))) query = query.gte('coin_balance', parseInt(minBalance));
    if (lockStatusValue !== 'all') query = query.eq('lock_status', lockStatusValue);

    const { data: users, count, error: queryError } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (queryError) {
        console.error('Admin users query error:', queryError);
    }

    // 2. STATS QUERY - Separate to avoid complex aggregations failing
    let statsQuery = serviceSupabase
        .from('profiles')
        .select('coin_balance, lock_status');

    if (roleFilter !== 'all') statsQuery = statsQuery.eq('role', roleFilter);
    if (email) statsQuery = statsQuery.ilike('email', `%${email}%`);
    if (phone) statsQuery = statsQuery.or(`phone.ilike.%${phone}%,zalo.ilike.%${phone}%`);
    if (dateFrom) statsQuery = statsQuery.gte('created_at', `${dateFrom}T00:00:00`);
    if (dateTo) statsQuery = statsQuery.lte('created_at', `${dateTo}T23:59:59`);
    if (minBalance && !isNaN(parseInt(minBalance))) statsQuery = statsQuery.gte('coin_balance', parseInt(minBalance));
    if (lockStatusValue !== 'all') statsQuery = statsQuery.eq('lock_status', lockStatusValue);

    const { data: statsData } = await statsQuery;

    const totalCoins = statsData?.reduce((sum, p) => sum + (p.coin_balance || 0), 0) || 0;
    const softLockedCount = statsData?.filter(p => p.lock_status === 'soft').length || 0;
    const hardLockedCount = statsData?.filter(p => p.lock_status === 'hard').length || 0;

    // 3. FETCH LISTING COUNTS SEPARATELY FOR THE CURRENT PAGE
    const userIds = users?.map(u => u.id) || [];
    const { data: listingCounts } = userIds.length > 0
        ? await serviceSupabase.rpc('get_user_listing_counts', { user_ids: userIds })
        : { data: [] };

    // Fallback if RPC doesn't exist yet: simplest count query
    // Actually, let's just use a manual count for each for now to be 100% safe
    const usersWithCounts = await Promise.all((users || []).map(async (u) => {
        const { count: listingCount } = await serviceSupabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', u.id);

        return { ...u, listing_count: listingCount || 0 } as Profile & { listing_count: number };
    }));

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8 p-4 sm:p-0">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý hệ thống</h1>
                <p className="text-sm text-slate-500 mt-1">Quản trị người dùng, trạng thái và kiểm soát truy cập</p>
            </div>

            {/* STATISTICS SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 px-4 sm:px-0">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Tổng số</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{count?.toLocaleString('vi-VN')}</div>
                    <div className="text-xs text-slate-400 mt-1">Người dùng theo bộ lọc</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Tổng xu</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{totalCoins.toLocaleString('vi-VN')}</div>
                    <div className="text-xs text-slate-400 mt-1">Trong toàn bộ ví theo bộ lọc</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Khóa mềm</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{softLockedCount}</div>
                    <div className="text-xs text-slate-400 mt-1">Đang bị hạn chế đăng bài</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Khóa cứng</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{hardLockedCount}</div>
                    <div className="text-xs text-slate-400 mt-1">Đã bị cấm đăng nhập</div>
                </div>
            </div>

            {/* Filter Component */}
            <div className="px-4 sm:px-0">
                <UserFilters />
            </div>

            {/* Users List - TABLE VIEW */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mx-4 sm:mx-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bài đăng</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Số dư ví</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {usersWithCounts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic font-medium bg-slate-50/50">
                                    Không tìm thấy người dùng nào phù hợp với bộ lọc
                                </td>
                            </tr>
                        ) : (
                            usersWithCounts.map((userProfile) => (
                                <tr key={userProfile.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm border-2 border-white">
                                                {userProfile.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 truncate max-w-[150px] inline-block">
                                                        {userProfile.email.split('@')[0]}
                                                    </span>
                                                    {userProfile.role === 'admin' && (
                                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-black uppercase flex items-center gap-0.5">
                                                            <Shield className="w-2.5 h-2.5" />
                                                            Ad
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Mail className="w-2.5 h-2.5" />
                                                    <span className="truncate max-w-[180px]">{userProfile.email}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Calendar className="w-2.5 h-2.5" />
                                                    {new Date(userProfile.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {userProfile.phone ? (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {userProfile.phone}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 italic">No phone</span>
                                            )}
                                            {userProfile.zalo && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-md w-fit">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {userProfile.zalo}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-lg">{userProfile.listing_count}</span>
                                            <Link
                                                href={`/admin/listings?userId=${userProfile.id}`}
                                                className="text-[10px] text-blue-600 hover:underline mt-0.5 font-bold"
                                            >
                                                Xem bài đăng
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1 font-black text-slate-900">
                                                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                                {userProfile.coin_balance.toLocaleString('vi-VN')}
                                            </div>
                                            <Link
                                                href={`/admin/topup?userId=${userProfile.id}`}
                                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-bold"
                                            >
                                                <TrendingUp className="w-2.5 h-2.5" /> Nạp xu
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {userProfile.lock_status === 'none' || !userProfile.lock_status ? (
                                            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase border border-green-100 tracking-wider">
                                                Active
                                            </span>
                                        ) : userProfile.lock_status === 'soft' ? (
                                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase border border-amber-100 flex items-center gap-1 justify-center mx-auto w-fit tracking-wider">
                                                <Lock className="w-3 h-3" /> Soft
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-black uppercase border border-red-100 flex items-center gap-1 justify-center mx-auto w-fit tracking-wider">
                                                <ShieldAlert className="w-3 h-3" /> Hard
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            {userProfile.id !== user.id ? (
                                                <UserLockButtons
                                                    userId={userProfile.id}
                                                    currentStatus={userProfile.lock_status || 'none'}
                                                    userEmail={userProfile.email}
                                                />
                                            ) : (
                                                <div className="px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[11px] font-bold border border-slate-100">
                                                    Admin (You)
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* DETERMINISTIC PAGINATION */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <Link
                        href={{
                            pathname: '/admin/users',
                            query: { ...params, page: Math.max(1, page - 1) }
                        }}
                        className={`px-4 py-2 border rounded-xl transition-all text-sm font-semibold shadow-sm ${page <= 1
                            ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400 border-slate-200'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:shadow-md'
                            }`}
                    >
                        Trước
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trang</span>
                        <div className="flex items-center justify-center min-w-[32px] h-[32px] text-sm font-black text-blue-600 bg-blue-50 rounded-lg border border-blue-100">
                            {page}
                        </div>
                        <span className="text-xs font-bold text-slate-400">/</span>
                        <span className="text-sm font-bold text-slate-700">{totalPages}</span>
                    </div>
                    <Link
                        href={{
                            pathname: '/admin/users',
                            query: { ...params, page: Math.min(totalPages, page + 1) }
                        }}
                        className={`px-4 py-2 border rounded-xl transition-all text-sm font-semibold shadow-sm ${page >= totalPages
                            ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400 border-slate-200'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:shadow-md'
                            }`}
                    >
                        Sau
                    </Link>
                </div>
            )}
        </div>
    );
}
