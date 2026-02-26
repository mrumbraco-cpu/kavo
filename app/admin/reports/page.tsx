import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Profile } from '@/types/profile';
import Link from 'next/link';
import { Flag, AlertTriangle, User, Calendar, ExternalLink, Filter } from 'lucide-react';
import AdminReportButtons from './AdminReportButtons';
import { getListingUrl } from '@/lib/utils/url';

const PAGE_SIZE = 20;

interface AdminReportsPageProps {
    searchParams: Promise<{
        page?: string;
        status?: string;
    }>;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
    const supabase = await createServerSupabaseClient();
    const params = await searchParams;

    const page = parseInt(params.page || '1', 10) || 1;
    const statusFilter = params.status || 'pending';

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

    // Fetch reports with related listing and user info
    let query = serviceSupabase
        .from('listing_reports')
        .select(`
            *,
            listing:listings (
                id,
                title,
                is_hidden,
                is_locked,
                status
            ),
            reporter:profiles!listing_reports_reporter_id_fkey (
                id,
                email
            )
        `, { count: 'exact' });

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    const { data: reports, count, error: queryError } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (queryError) {
        console.error('Admin reports query error:', queryError);
    }

    const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-0">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Flag className="w-8 h-8 text-red-500" />
                    Quản lý báo cáo
                </h1>
                <p className="text-sm text-slate-500 mt-1">Xử lý các vi phạm nội dung và ý kiến từ người dùng</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit mb-8 shadow-sm">
                {[
                    { label: 'Chờ xử lý', value: 'pending' },
                    { label: 'Đã giải quyết', value: 'resolved' },
                    { label: 'Đã bỏ qua', value: 'ignored' },
                    { label: 'Tất cả', value: 'all' }
                ].map((item) => (
                    <Link
                        key={item.value}
                        href={{
                            pathname: '/admin/reports',
                            query: { ...params, status: item.value, page: 1 }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === item.value
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tin bị báo cáo</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lý do & Mô tả</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người báo cáo</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!reports || reports.length === 0) ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic font-medium bg-slate-50/50">
                                    Không có báo cáo nào
                                </td>
                            </tr>
                        ) : (
                            reports.map((report: any) => (
                                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        {report.listing ? (
                                            <div className="flex flex-col gap-1 max-w-[250px]">
                                                <span className="font-bold text-slate-900 line-clamp-1">{report.listing.title}</span>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={getListingUrl(report.listing)}
                                                        target="_blank"
                                                        className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        Xem tin <ExternalLink className="w-2.5 h-2.5" />
                                                    </Link>
                                                    <span className={`text-[9px] px-1 rounded font-black uppercase ${report.listing.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {report.listing.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-red-400 italic">Tin đã bị xóa</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 max-w-[350px]">
                                            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                                {report.reason}
                                            </span>
                                            {report.description && (
                                                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                                                    "{report.description}"
                                                </p>
                                            ) || <span className="text-[10px] text-slate-300 italic">Không có mô tả chi tiết</span>}
                                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(report.created_at).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-xs text-slate-600">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-3 h-3" />
                                                {report.reporter?.email.split('@')[0]}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{report.reporter?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <AdminReportButtons
                                                reportId={report.id}
                                                reportStatus={report.status}
                                                listingId={report.listing_id}
                                                listingIsHidden={report.listing?.is_hidden}
                                                listingIsLocked={report.listing?.is_locked}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <Link
                        href={{
                            pathname: '/admin/reports',
                            query: { ...params, page: Math.max(1, page - 1) }
                        }}
                        className={`px-4 py-2 border rounded-xl transition-all text-sm font-semibold ${page <= 1 ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                        Trước
                    </Link>
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                        Trang {page} / {totalPages}
                    </span>
                    <Link
                        href={{
                            pathname: '/admin/reports',
                            query: { ...params, page: Math.min(totalPages, page + 1) }
                        }}
                        className={`px-4 py-2 border rounded-xl transition-all text-sm font-semibold ${page >= totalPages ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                        Sau
                    </Link>
                </div>
            )}
        </div>
    );
}
