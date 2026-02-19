import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Listing, ListingStatus } from '@/types/listing';
import { Profile } from '@/types/profile';
import AdminListingButtons from './AdminListingButtons';
import ListingFilters from './ListingFilters';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle, EyeOff, Lock, User, Mail, Calendar, Phone, Globe, AlertCircle } from 'lucide-react';

const PAGE_SIZE = 20;

interface AdminListingsPageProps {
    searchParams: Promise<{
        page?: string;
        userId?: string;
        email?: string;
        phone?: string;
        date_from?: string;
        date_to?: string;
        status?: string;
        is_hidden?: string;
        is_locked?: string;
        creator_type?: string;
    }>;
}

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
    const supabase = await createServerSupabaseClient();
    const params = await searchParams;

    const page = parseInt(params.page || '1', 10) || 1;
    const targetUserId = params.userId;
    const email = params.email;
    const phone = params.phone;
    const dateFrom = params.date_from;
    const dateTo = params.date_to;
    const statusFilter = params.status || 'all';
    const isHiddenFilter = params.is_hidden || 'all';
    const isLockedFilter = params.is_locked || 'all';
    const creatorTypeFilter = params.creator_type || 'all';

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

    // BUILD MAIN QUERY
    let query = serviceSupabase
        .from('listings')
        .select(`
            *,
            owner:profiles!listings_owner_id_fkey (
                id,
                email,
                phone,
                zalo,
                role
            )
        `, { count: 'exact' });

    // APPLY FILTERS
    if (targetUserId) query = query.eq('owner_id', targetUserId);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (isHiddenFilter !== 'all') query = query.eq('is_hidden', isHiddenFilter === 'true');
    if (isLockedFilter !== 'all') query = query.eq('is_locked', isLockedFilter === 'true');
    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);

    // Owner info filters (require filtering the joined profile)
    // Note: PostgREST filtering on joined tables can be tricky if we want HARD filtering of the main record.
    // In this case, we use owner.email.ilike but it might return listings where owner matches.
    if (email) query = query.ilike('owner.email', `%${email}%`);
    if (phone) query = query.or(`phone.ilike.%${phone}%,zalo.ilike.%${phone}%`, { foreignTable: 'owner' });
    if (creatorTypeFilter !== 'all') query = query.eq('owner.role', creatorTypeFilter);

    const { data: listings, count, error: queryError } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (queryError) {
        console.error('Admin listings query error:', queryError);
    }

    // STATS QUERY - Based on same filters but without pagination
    let statsQuery = serviceSupabase
        .from('listings')
        .select('status, is_hidden, is_locked, owner:profiles!listings_owner_id_fkey(role, email, phone, zalo)');

    if (targetUserId) statsQuery = statsQuery.eq('owner_id', targetUserId);
    if (statusFilter !== 'all') statsQuery = statsQuery.eq('status', statusFilter);
    if (isHiddenFilter !== 'all') statsQuery = statsQuery.eq('is_hidden', isHiddenFilter === 'true');
    if (isLockedFilter !== 'all') statsQuery = statsQuery.eq('is_locked', isLockedFilter === 'true');
    if (dateFrom) statsQuery = statsQuery.gte('created_at', `${dateFrom}T00:00:00`);
    if (dateTo) statsQuery = statsQuery.lte('created_at', `${dateTo}T23:59:59`);
    if (email) statsQuery = statsQuery.ilike('owner.email', `%${email}%`);
    if (phone) statsQuery = statsQuery.or(`phone.ilike.%${phone}%,zalo.ilike.%${phone}%`, { foreignTable: 'owner' });
    if (creatorTypeFilter !== 'all') statsQuery = statsQuery.eq('owner.role', creatorTypeFilter);

    const { data: statsData } = await statsQuery;

    const stats = {
        total: statsData?.length || 0,
        pending: statsData?.filter(l => l.status === 'pending').length || 0,
        active: statsData?.filter(l => l.status === 'approved' && !l.is_hidden).length || 0,
        expired: statsData?.filter(l => l.status === 'expired').length || 0,
        hidden: statsData?.filter(l => l.is_hidden).length || 0,
        locked: statsData?.filter(l => l.is_locked).length || 0,
    };

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8 p-4 sm:p-0">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý tin đăng</h1>
                <p className="text-sm text-slate-500 mt-1">Kiểm duyệt và điều phối toàn bộ nội dung hệ thống</p>
                {targetUserId && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900">
                                Đang lọc bài bởi user ID: {targetUserId.slice(0, 8)}...
                            </span>
                        </div>
                        <Link href="/admin/listings" className="text-xs font-black text-blue-600 hover:underline uppercase tracking-tight">
                            Xem tất cả
                        </Link>
                    </div>
                )}
            </div>

            {/* STATISTICS SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8 px-4 sm:px-0">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tổng tin</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Chờ duyệt</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.pending}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Đang hiển thị</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.active}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-rose-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Hết hạn</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.expired}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                            <EyeOff className="w-5 h-5 text-gray-500" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Đang ẩn</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.hidden}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Khóa soạn</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stats.locked}</div>
                </div>
            </div>

            {/* Filter Component */}
            <div className="px-4 sm:px-0">
                <ListingFilters />
            </div>

            {/* Listings List - TABLE VIEW */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mx-4 sm:mx-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin tin đăng</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người đăng</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!listings || listings.length === 0) ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic font-medium bg-slate-50/50">
                                    Không tìm thấy tin đăng nào phù hợp với bộ lọc
                                </td>
                            </tr>
                        ) : (
                            listings.map((item) => {
                                const listing = item as any; // Cast for joined owner
                                const owner = listing.owner;
                                return (
                                    <tr key={listing.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 max-w-[400px]">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 mb-1 line-clamp-2" title={listing.title}>
                                                    {listing.title}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-300" />
                                                        {new Date(listing.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                        ID: {listing.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {owner ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {owner.email.split('@')[0]}
                                                        </span>
                                                        {owner.role === 'admin' && (
                                                            <span className="text-[9px] bg-purple-100 text-purple-700 font-black px-1 rounded">ADMIN</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Mail className="w-3 h-3" />
                                                        {owner.email}
                                                    </div>
                                                    {owner.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Phone className="w-3 h-3" />
                                                            {owner.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 italic">Unknown Owner</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-wrap items-center gap-2 justify-center">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${listing.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    listing.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        listing.status === 'expired' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-slate-50 text-slate-600 border-slate-100'
                                                    }`}>
                                                    {listing.status === 'pending' ? 'Chờ duyệt' :
                                                        listing.status === 'approved' ? 'Đã duyệt' :
                                                            listing.status === 'expired' ? 'Hết hạn' : 'Nháp'}
                                                </span>
                                                {listing.is_hidden && (
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                                                        <EyeOff className="w-3 h-3" /> Ẩn
                                                    </span>
                                                )}
                                                {listing.is_locked && (
                                                    <span className="px-2 py-1 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Khóa soạn
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <AdminListingButtons
                                                    id={listing.id}
                                                    status={listing.status}
                                                    isHidden={listing.is_hidden}
                                                    isLocked={listing.is_locked}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* DETERMINISTIC PAGINATION */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <Link
                        href={{
                            pathname: '/admin/listings',
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
                            pathname: '/admin/listings',
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
