'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Search, X, Filter, Calendar, User, EyeOff, Lock, MapPin } from 'lucide-react'
import {
    PROVINCES_OLD,
    DISTRICTS_OLD_BY_PROVINCE,
    PROVINCES_NEW,
    WARDS_NEW_BY_PROVINCE
} from '@/lib/constants/geography'

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
        geo_system: searchParams.get('geo_system') || 'all',
        province: searchParams.get('province') || '',
        sub_local: searchParams.get('sub_local') || '',
    })

    const [isExpanded, setIsExpanded] = useState(false)

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
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
            geo_system: 'all',
            province: '',
            sub_local: '',
        })
        router.push('/admin/listings')
    }

    const availableProvinces = useMemo(() => {
        if (filters.geo_system === 'old') return PROVINCES_OLD;
        if (filters.geo_system === 'new') return PROVINCES_NEW;
        return [...PROVINCES_OLD, ...PROVINCES_NEW];
    }, [filters.geo_system]);

    const availableSubLocals = useMemo(() => {
        if (!filters.province) return [];
        if (filters.geo_system === 'old') return DISTRICTS_OLD_BY_PROVINCE[filters.province] || [];
        if (filters.geo_system === 'new') return WARDS_NEW_BY_PROVINCE[filters.province] || [];
        return (DISTRICTS_OLD_BY_PROVINCE[filters.province] || WARDS_NEW_BY_PROVINCE[filters.province] || []) as string[];
    }, [filters.province, filters.geo_system]);

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
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Owner Email */}
                    <div className="space-y-1">
                        <label htmlFor="filter-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email chủ tin</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                id="filter-email"
                                type="text"
                                value={filters.email}
                                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                                autoComplete="off"
                                placeholder="Email..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Owner Phone */}
                    <div className="space-y-1">
                        <label htmlFor="filter-phone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SĐT chủ tin</label>
                        <input
                            id="filter-phone"
                            type="tel"
                            inputMode="tel"
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            autoComplete="off"
                            placeholder="Số điện thoại..."
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label htmlFor="filter-status" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trạng thái duyệt</label>
                        <select
                            id="filter-status"
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
                        <label htmlFor="filter-creator" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Loại người đăng</label>
                        <select
                            id="filter-creator"
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ngày tạo tin (Từ - Đến)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                aria-label="Từ ngày"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <span className="text-slate-400">→</span>
                            <input
                                type="date"
                                aria-label="Đến ngày"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-1">
                        <label htmlFor="filter-hidden" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trạng thái ẩn/hiện</label>
                        <select
                            id="filter-hidden"
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
                        <label htmlFor="filter-lock" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trạng thái khóa soạn</label>
                        <select
                            id="filter-lock"
                            value={filters.is_locked}
                            onChange={(e) => setFilters({ ...filters, is_locked: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                        >
                            <option value="all">Tất cả</option>
                            <option value="true">Đã khóa soạn</option>
                            <option value="false">Không bị khóa soạn</option>
                        </select>
                    </div>

                    {/* Geography System */}
                    <div className="space-y-1">
                        <label htmlFor="filter-geo-system" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hệ thống địa lý</label>
                        <select
                            id="filter-geo-system"
                            value={filters.geo_system}
                            onChange={(e) => setFilters({ ...filters, geo_system: e.target.value, province: '', sub_local: '' })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
                        >
                            <option value="all">Tất cả hệ thống</option>
                            <option value="old">Hệ thống cũ</option>
                            <option value="new">Hệ thống mới</option>
                        </select>
                    </div>

                    {/* Province Selection */}
                    <div className="space-y-1">
                        <label htmlFor="filter-province" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tỉnh / Thành phố</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                id="filter-province"
                                value={filters.province}
                                onChange={(e) => setFilters({ ...filters, province: e.target.value, sub_local: '' })}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium appearance-none"
                            >
                                <option value="">Tất cả tỉnh thành</option>
                                {availableProvinces.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Sub-locality Selection */}
                    <div className="space-y-1">
                        <label htmlFor="filter-sub-local" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Địa phương con</label>
                        <select
                            id="filter-sub-local"
                            value={filters.sub_local}
                            onChange={(e) => setFilters({ ...filters, sub_local: e.target.value })}
                            disabled={!filters.province}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value="">Tất cả (Quận/Huyện/Phường/Xã)</option>
                            {availableSubLocals.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-end gap-2 lg:col-start-4 lg:justify-end mt-2 sm:mt-0">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Xóa lọc
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            Tìm kiếm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
