import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Profile } from '@/types/profile';
import Link from 'next/link';
import { Wallet, TrendingUp, TrendingDown, Calendar, Search, Users, Layers, Activity, ListChecks } from 'lucide-react';
import WalletFilters from '@/components/admin/WalletFilters';

const PAGE_SIZE = 20;

interface CoinTransaction {
    id: string;
    user_id: string;
    type: 'topup' | 'unlock' | 'admin_adjustment';
    amount: number;
    balance_after: number;
    metadata?: any;
    reference?: string;
    created_at: string;
    profiles?: {
        email: string;
    };
}

interface AdminWalletsPageProps {
    searchParams: Promise<{
        page?: string;
        email?: string;
        type?: string;
        start_date?: string;
        end_date?: string;
    }>;
}

export default async function AdminWalletsPage({ searchParams }: AdminWalletsPageProps) {
    const supabase = await createServerSupabaseClient();
    const params = await searchParams;
    const page = parseInt(params.page || '1', 10);
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

    // Fetch data using service role (bypasses RLS)
    const serviceSupabase = createServiceRoleClient();

    // --- MASTER STATISTICS (Global, ignore filters) ---
    // Get total coins and avg
    const { data: globalStats } = await serviceSupabase
        .from('profiles')
        .select('coin_balance');
    const totalCoins = globalStats?.reduce((sum, p) => sum + (p.coin_balance || 0), 0) || 0;
    const avgCoins = globalStats && globalStats.length > 0 ? Math.round(totalCoins / globalStats.length) : 0;

    // Get absolute total transactions count
    const { count: globalTransactionCount } = await serviceSupabase
        .from('coin_transactions')
        .select('*', { count: 'exact', head: true });

    // --- FILTERED DATA ---

    // 1. Pre-calculate Email Filter if needed
    let userIds: string[] | null = null;
    if (params.email) {
        const { data: userProfiles } = await serviceSupabase
            .from('profiles')
            .select('id')
            .ilike('email', `%${params.email}%`);
        userIds = userProfiles?.map(p => p.id) || [];
    }

    // Helper to apply all common filters
    const applyFilters = (q: any) => {
        let currentQ = q;
        if (params.email) {
            if (userIds && userIds.length > 0) {
                currentQ = currentQ.in('user_id', userIds);
            } else {
                currentQ = currentQ.eq('user_id', '00000000-0000-0000-0000-000000000000');
            }
        }
        if (params.type && params.type !== 'all') {
            currentQ = currentQ.eq('type', params.type);
        }
        if (params.start_date) {
            currentQ = currentQ.gte('created_at', `${params.start_date}T00:00:00`);
        }
        if (params.end_date) {
            currentQ = currentQ.lte('created_at', `${params.end_date}T23:59:59`);
        }
        return currentQ;
    };

    // 2. Fetch summary stats for the ENTIRE filtered set
    const summaryQuery = applyFilters(
        serviceSupabase.from('coin_transactions').select('amount, user_id, type, created_at')
    );
    const { data: allFilteredData } = await summaryQuery;

    const summary = {
        totalAmount: 0,
        uniqueUsers: new Set<string>(),
        uniqueTypes: new Set<string>(),
        uniqueDays: new Set<string>()
    };

    if (allFilteredData) {
        allFilteredData.forEach((tx: any) => {
            summary.totalAmount += (tx.amount || 0);
            summary.uniqueUsers.add(tx.user_id);
            summary.uniqueTypes.add(tx.type);
            summary.uniqueDays.add(new Date(tx.created_at).toISOString().split('T')[0]);
        });
    }

    // 3. Fetch paginated transactions
    const listQuery = applyFilters(
        serviceSupabase.from('coin_transactions').select(`
            id,
            user_id,
            type,
            amount,
            balance_after,
            created_at,
            metadata,
            reference,
            profiles!coin_transactions_user_id_fkey (
                email
            )
        `, { count: 'exact' })
    );

    const { data: transactions, count: filteredCount } = await listQuery
        .order('created_at', { ascending: false })
        .range(from, to);

    const typedTransactions = (transactions || []) as CoinTransaction[];
    const totalPages = Math.ceil((filteredCount || 0) / PAGE_SIZE);

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case 'topup':
                return 'Nạp xu';
            case 'unlock':
                return 'Mở khóa';
            case 'admin_adjustment':
                return 'Điều chỉnh';
            default:
                return type;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'topup':
            case 'admin_adjustment':
                return 'text-green-600';
            case 'unlock':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getTransactionNote = (transaction: CoinTransaction) => {
        if (!transaction.metadata && !transaction.reference) return '-';
        if (transaction.metadata?.note) return transaction.metadata.note;
        if (transaction.metadata?.description) return transaction.metadata.description;
        return transaction.reference || '-';
    };

    const getUrlWithFilters = (pageNumber: number) => {
        const queryParams = new URLSearchParams();
        queryParams.set('page', pageNumber.toString());
        if (params.email) queryParams.set('email', params.email);
        if (params.type) queryParams.set('type', params.type);
        if (params.start_date) queryParams.set('start_date', params.start_date);
        if (params.end_date) queryParams.set('end_date', params.end_date);
        return `/admin/wallets?${queryParams.toString()}#transactions-list`;
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Quản lý ví người dùng</h1>
                <p className="text-sm text-gray-600 mt-1">Theo dõi giao dịch xu và số dư ví toàn hệ thống</p>
            </div>

            {/* Statistics Cards (Master) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-700">Tổng xu hệ thống</h3>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-700">
                        {totalCoins.toLocaleString('vi-VN')}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-700">Trung bình xu/người</h3>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                        {avgCoins.toLocaleString('vi-VN')}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-700">Tổng giao dịch hệ thống</h3>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-700">
                        {globalTransactionCount?.toLocaleString('vi-VN') || 0}
                    </p>
                </div>
            </div>

            {/* Filters Form (Client Side) */}
            <WalletFilters initialFilters={{
                email: params.email,
                type: params.type,
                start_date: params.start_date,
                end_date: params.end_date
            }} />

            {/* Search Results Summary Stats (DYNAMIC) */}
            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-800">Kết quả lọc dữ liệu</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Biến động xu</span>
                            <Wallet className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className={`text-xl font-bold ${summary.totalAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {summary.totalAmount > 0 ? '+' : ''}{summary.totalAmount.toLocaleString('vi-VN')}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Người dùng</span>
                            <Users className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                            {summary.uniqueUsers.size.toLocaleString('vi-VN')}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Loại giao dịch</span>
                            <Layers className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                            {summary.uniqueTypes.size.toLocaleString('vi-VN')}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Số ngày</span>
                            <Calendar className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                            {summary.uniqueDays.size.toLocaleString('vi-VN')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div id="transactions-list" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-20">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh sách chi tiết</h2>
                    <span className="text-xs text-gray-500 font-medium">Tìm thấy {filteredCount?.toLocaleString('vi-VN')} bản ghi</span>
                </div>

                {typedTransactions.length === 0 ? (
                    <div className="p-12 text-center bg-white">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">Không tìm thấy dữ liệu phù hợp</p>
                        <p className="text-slate-400 text-sm mt-1">Vui lòng thử điều chỉnh lại bộ lọc</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Người dùng
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Loại giao dịch
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Số xu
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Số dư sau
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Thời gian
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Ghi chú
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {typedTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-900 group relative">
                                                {transaction.profiles?.email || 'Unknown'}
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                    ID: {transaction.user_id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${transaction.type === 'topup' || transaction.type === 'admin_adjustment'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                }`}>
                                                {getTransactionTypeLabel(transaction.type)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${getTransactionColor(transaction.type)}`}>
                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                                {transaction.balance_after?.toLocaleString('vi-VN') || '0'} xu
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {new Date(transaction.created_at).toLocaleString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-500 italic max-w-xs truncate" title={getTransactionNote(transaction)}>
                                            {getTransactionNote(transaction)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-8 sm:mt-12 flex justify-center items-center gap-3 sm:gap-4">
                    <Link
                        href={getUrlWithFilters(Math.max(1, page - 1))}
                        scroll={false}
                        className={`px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm font-semibold ${page <= 1
                            ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400 border-slate-200'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
                            }`}
                    >
                        Trước
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trang</span>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-bold shadow-sm">
                            {page}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">trên</span>
                        <span className="text-sm font-bold text-slate-700">
                            {totalPages}
                        </span>
                    </div>
                    <Link
                        href={getUrlWithFilters(Math.min(totalPages, page + 1))}
                        scroll={false}
                        className={`px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm font-semibold ${page >= totalPages
                            ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400 border-slate-200'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
                            }`}
                    >
                        Sau
                    </Link>
                </div>
            )}
        </div>
    );
}
