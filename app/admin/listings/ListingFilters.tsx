'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, X, Filter, Calendar, User, EyeOff, Lock } from 'lucide-react'

export default function ListingFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [filters, setFilters] = useState({
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        date_from: searchParams.get('date_from') || '',
        date_to: searchParams.get('date_to') || '',
        status: searchParams.get('status') || 'all',
        is_hidden: searchParams.get('is_hidden') || 'all',
        is_locked: searchParams.get('is_locked') || 'all',
        creator_type: searchParams.get('creator_type') || 'all',
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

        params.set('page', '1')
        router.push(`/admin/listings?${params.toString()}`)
    }

    const handleReset = () => {
        setFilters({
            email: '',
            phone: '',
            date_from: '',
            date_to: '',
            status: 'all',
            is_hidden: 'all',
            is_locked: 'all',
            creator_type: 'all',
        })
        router.push('/admin/listings')
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-700 text-sm">Bộ lọc tin đăng</span>
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
                    {/* Owner Email */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email chủ tin</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={filters.email}
                                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                                placeholder="Email..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Owner Phone */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SĐT chủ tin</label>
                        <input
                            type="text"
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            placeholder="Số điện thoại..."
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái duyệt</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt (Pending)</option>
                            <option value="approved">Đã duyệt (Approved)</option>
                            <option value="expired">Hết hạn (Expired)</option>
                            <option value="draft">Bản nháp (Draft)</option>
                        </select>
                    </div>

                    {/* Creator Type */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại người đăng</label>
                        <select
                            value={filters.creator_type}
                            onChange={(e) => setFilters({ ...filters, creator_type: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                        >
                            <option value="all">Tất cả</option>
                            <option value="admin">Bài bởi Admin</option>
                            <option value="user">Bài bởi Người dùng</option>
                        </select>
                    </div>

                    {/* Date Joined Range */}
                    <div className="space-y-1 lg:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày tạo tin (Từ - Đến)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <span className="text-slate-400">→</span>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái ẩn/hiện</label>
                        <select
                            value={filters.is_hidden}
                            onChange={(e) => setFilters({ ...filters, is_hidden: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                        >
                            <option value="all">Tất cả</option>
                            <option value="true">Đang ẩn</option>
                            <option value="false">Đang hiện</option>
                        </select>
                    </div>

                    {/* Lock Status */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái khóa soạn</label>
                        <select
                            value={filters.is_locked}
                            onChange={(e) => setFilters({ ...filters, is_locked: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                        >
                            <option value="all">Tất cả</option>
                            <option value="true">Đã khóa soạn</option>
                            <option value="false">Không bị khóa soạn</option>
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
