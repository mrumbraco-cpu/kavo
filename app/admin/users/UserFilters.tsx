'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X, Filter, Calendar, Coins } from 'lucide-react'

export default function UserFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [filters, setFilters] = useState({
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        date_from: searchParams.get('date_from') || '',
        date_to: searchParams.get('date_to') || '',
        min_balance: searchParams.get('min_balance') || '',
        lock_status: searchParams.get('lock_status') || 'all',
        role: searchParams.get('role') || 'all',
    })

    const [isExpanded, setIsExpanded] = useState(false)

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        // Reset to page 1 on search
        params.set('page', '1')

        router.push(`/admin/users?${params.toString()}`)
    }

    const handleReset = () => {
        setFilters({
            email: '',
            phone: '',
            date_from: '',
            date_to: '',
            min_balance: '',
            lock_status: 'all',
            role: 'all',
        })
        router.push('/admin/users')
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-700 text-sm">Bộ lọc tìm kiếm</span>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                >
                    {isExpanded ? 'Thu gọn' : 'Mở rộng bộ lọc'}
                </button>
            </div>

            <div className={`p-4 transition-all ${isExpanded ? 'block' : 'hidden md:block'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Email</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={filters.email}
                                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                                placeholder="Tìm email..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Số điện thoại</label>
                        <input
                            type="text"
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            placeholder="Số điện thoại..."
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Lock Status */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Trạng thái khóa</label>
                        <select
                            value={filters.lock_status}
                            onChange={(e) => setFilters({ ...filters, lock_status: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="none">Không khóa</option>
                            <option value="soft">Khóa mềm</option>
                            <option value="hard">Khóa cứng</option>
                        </select>
                    </div>

                    {/* Min Balance */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Số dư tối thiểu</label>
                        <div className="relative">
                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                            <input
                                type="number"
                                value={filters.min_balance}
                                onChange={(e) => setFilters({ ...filters, min_balance: e.target.value })}
                                placeholder="Ví dụ: 1000"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Date Joined Range */}
                    <div className="space-y-1 lg:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Ngày tham gia (Từ - Đến)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                            <span className="text-slate-400">→</span>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Vai trò</label>
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-end gap-2 lg:col-start-4 lg:justify-end mt-2 sm:mt-0">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Xóa lọc
                        </button>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
