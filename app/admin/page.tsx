import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Profile } from '@/types/profile';
import Link from 'next/link';
import { Users, FileText, Wallet, TrendingUp, Clock } from 'lucide-react';

export default async function AdminDashboardPage() {
    const supabase = await createServerSupabaseClient();

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

    // Fetch statistics using service role (bypasses RLS)
    // This is safe because we verified admin role above
    const serviceSupabase = createServiceRoleClient();

    const { count: totalUsers } = await serviceSupabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: totalListings } = await serviceSupabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

    const { count: pendingListings } = await serviceSupabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const { data: coinStats } = await serviceSupabase
        .from('profiles')
        .select('coin_balance');

    const totalCoins = coinStats?.reduce((sum, p) => sum + (p.coin_balance || 0), 0) || 0;

    const stats = [
        {
            icon: Users,
            label: 'Tổng người dùng',
            value: totalUsers || 0,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'from-blue-50 to-indigo-50',
            href: '/admin/users',
        },
        {
            icon: FileText,
            label: 'Tổng tin đăng',
            value: totalListings || 0,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50',
            href: '/admin/listings',
        },
        {
            icon: Clock,
            label: 'Tin chờ duyệt',
            value: pendingListings || 0,
            color: 'from-amber-500 to-orange-600',
            bgColor: 'from-amber-50 to-orange-50',
            href: '/admin/listings',
        },
        {
            icon: Wallet,
            label: 'Tổng xu trong hệ thống',
            value: totalCoins.toLocaleString('vi-VN'),
            color: 'from-yellow-500 to-amber-600',
            bgColor: 'from-yellow-50 to-amber-50',
            href: '/admin/wallets',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bảng điều khiển Admin</h1>
                <p className="text-sm text-gray-600 mt-1">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="group"
                    >
                        <div className={`bg-gradient-to-br ${stat.bgColor} rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <Link
                        href="/admin/listings/new"
                        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Đăng tin mới</p>
                            <p className="text-xs text-gray-600">Tạo tin đăng mới</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Quản lý người dùng</p>
                            <p className="text-xs text-gray-600">Xem danh sách người dùng</p>
                        </div>
                    </Link>

                    <Link
                        href="/admin/topup"
                        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Topup xu</p>
                            <p className="text-xs text-gray-600">Nạp xu cho người dùng</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
