'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface WalletFiltersProps {
    initialFilters: {
        email?: string;
        type?: string;
        start_date?: string;
        end_date?: string;
    };
}

export default function WalletFilters({ initialFilters }: WalletFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState(initialFilters);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1'); // Reset to page 1 on search

        if (filters.email) params.set('email', filters.email);
        else params.delete('email');

        if (filters.type && filters.type !== 'all') params.set('type', filters.type);
        else params.delete('type');

        if (filters.start_date) params.set('start_date', filters.start_date);
        else params.delete('start_date');

        if (filters.end_date) params.set('end_date', filters.end_date);
        else params.delete('end_date');

        router.push(`/admin/wallets?${params.toString()}#transactions-list`, { scroll: false });
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-8 shadow-sm">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Email người dùng</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            name="email"
                            type="text"
                            value={filters.email || ''}
                            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                            placeholder="Search email..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Loại giao dịch</label>
                    <select
                        name="type"
                        value={filters.type || 'all'}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="topup">Nạp xu</option>
                        <option value="unlock">Mở khóa</option>
                        <option value="admin_adjustment">Điều chỉnh</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Từ ngày</label>
                    <input
                        name="start_date"
                        type="date"
                        value={filters.start_date || ''}
                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Đến ngày</label>
                    <input
                        name="end_date"
                        type="date"
                        value={filters.end_date || ''}
                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Tìm kiếm
                    </button>
                    <Link
                        href="/admin/wallets#transactions-list"
                        scroll={false}
                        onClick={() => setFilters({})}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors text-center"
                    >
                        Reset
                    </Link>
                </div>
            </form>
        </div>
    );
}
