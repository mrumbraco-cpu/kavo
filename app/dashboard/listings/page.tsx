import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import Image from 'next/image'
import Link from 'next/link'
import {
    Edit,
    Eye,
    MapPin,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    EyeOff,
    Lock,
    LayoutGrid,
    Search,
    AlertCircle,
    Calendar,
    ArrowUpRight,
    Building2,
    Globe
} from 'lucide-react'
import { ListingStatus } from '@/types/listing'
import VisibilityToggle from './VisibilityToggle'

function formatCurrency(amount: number) {
    if (typeof amount !== 'number') return '0 ₫'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount)
}

function StatusBadge({ status, isHidden, isLocked }: { status: ListingStatus, isHidden?: boolean, isLocked?: boolean }) {
    const badges = []

    // 1. Base Status Badge
    const configs: Record<string, { label: string, styles: string, icon: any }> = {
        draft: {
            label: 'Nháp',
            styles: 'bg-slate-50 text-slate-600 border-slate-100',
            icon: Edit
        },
        pending: {
            label: 'Chờ duyệt',
            styles: 'bg-amber-50 text-amber-700 border-amber-100',
            icon: Clock
        },
        approved: {
            label: 'Đã duyệt',
            styles: 'bg-green-50 text-green-700 border-green-100',
            icon: CheckCircle2
        },
        expired: {
            label: 'Hết hạn',
            styles: 'bg-rose-50 text-rose-700 border-rose-100',
            icon: AlertCircle
        }
    }

    const config = configs[status] || configs.draft
    const Icon = config.icon

    badges.push(
        <span key="status" className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${config.styles}`}>
            <Icon className="w-3 h-3" /> {config.label}
        </span>
    )

    // 2. Hidden Badge
    if (isHidden) {
        badges.push(
            <span key="hidden" className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-gray-50 text-gray-500 border border-gray-100 shadow-sm">
                <EyeOff className="w-3 h-3" /> Đang Ẩn
            </span>
        )
    }

    // 3. Locked Badge
    if (isLocked) {
        badges.push(
            <span key="locked" className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-red-50 text-red-600 border border-red-100 shadow-sm">
                <Lock className="w-3 h-3" /> Khóa soạn
            </span>
        )
    }

    return (
        <div className="flex flex-wrap gap-2">
            {badges}
        </div>
    )
}

export default async function MyListingsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const resolvedParams = await searchParams
    const page = parseInt(resolvedParams.page || '1', 10)
    const itemsPerPage = 6
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    // Get total count & stats
    const { data: allUserListings } = await supabase
        .from('listings')
        .select('id, status, is_hidden, is_locked')
        .eq('owner_id', user.id)

    const stats = {
        total: allUserListings?.length || 0,
        approved: allUserListings?.filter(l => l.status === 'approved' && !l.is_hidden).length || 0,
        pending: allUserListings?.filter(l => l.status === 'pending').length || 0,
        expired: allUserListings?.filter(l => l.status === 'expired').length || 0,
        hidden: allUserListings?.filter(l => l.is_hidden).length || 0,
        locked: allUserListings?.filter(l => l.is_locked).length || 0,
    }

    // Get paginated listings
    const { data: listings, count } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

    const totalPages = Math.ceil((count || 0) / itemsPerPage)

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
            {/* Header Section with glassmorphism feel */}
            <div className="mb-10 px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">Workspace</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            Quản lý tin đăng
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            Theo dõi và tối ưu hóa hiệu quả các không gian của bạn
                        </p>
                    </div>

                    <Link
                        href="/dashboard/listings/new"
                        className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Plus className="relative w-5 h-5" />
                        <span className="relative">Tạo tin đăng mới</span>
                        <ArrowUpRight className="relative w-4 h-4 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10 px-4 sm:px-0">
                {[
                    { label: 'Tổng tin đăng', value: stats.total, icon: LayoutGrid, color: 'blue' },
                    { label: 'Đang hiển thị', value: stats.approved, icon: Globe, color: 'emerald' },
                    { label: 'Chờ phê duyệt', value: stats.pending, icon: Clock, color: 'amber' },
                    { label: 'Hết hạn', value: stats.expired, icon: AlertCircle, color: 'rose' },
                    { label: 'Đang ẩn', value: stats.hidden, icon: EyeOff, color: 'slate' },
                    { label: 'Khóa soạn', value: stats.locked, icon: Lock, color: 'red' },
                ].map((stat, idx) => (
                    <div key={idx} className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            {!listings || listings.length === 0 ? (
                <div className="mx-4 sm:mx-0 p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có dữ liệu nào</h3>
                    <p className="text-slate-400 max-w-sm mb-8 font-medium">Bạn chưa đăng tải không gian nào lên hệ thống. Hãy bắt đầu ngay để tiếp cận khách hàng tiềm năng.</p>
                    <Link
                        href="/dashboard/listings/new"
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                        Bắt đầu đăng tin
                    </Link>
                </div>
            ) : (
                <div className="space-y-6 px-4 sm:px-0">
                    {/* Filter/Search Bar Placeholder - Could be implemented later */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing: any, index: number) => (
                            <div
                                key={listing.id}
                                className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500 overflow-hidden flex flex-col border-b-4 border-b-slate-100 hover:border-b-blue-600"
                            >
                                {/* Media Section */}
                                <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                                    {listing.images && listing.images.length > 0 ? (
                                        <Image
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={index < 3}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                                            <Building2 className="w-12 h-12 mb-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                                        </div>
                                    )}

                                    {/* Overlay Badges */}
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                        <div className="pointer-events-auto">
                                            <StatusBadge
                                                status={listing.status}
                                                isHidden={listing.is_hidden}
                                                isLocked={listing.is_locked}
                                            />
                                        </div>
                                        {listing.status === 'approved' && !listing.is_hidden && !listing.is_locked && (
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Tag Overlay */}
                                    <div className="absolute bottom-4 left-4">
                                        <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block leading-none mb-0.5">Bắt đầu từ</span>
                                            <span className="text-sm font-black text-blue-600 tracking-tight leading-none">
                                                {formatCurrency(listing.price_min)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {listing.title}
                                        </h3>

                                        <div className="flex items-center gap-2 text-slate-400 mb-4 pb-4 border-b border-slate-50">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500/50" />
                                            <span className="text-xs font-medium truncate">
                                                {listing.district_old}, {listing.province_old}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Hành chính mới</div>
                                                <div className="text-[11px] font-bold text-slate-600 truncate">{listing.ward_new}</div>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-end">
                                                <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5 text-right w-full">Ngày đăng</div>
                                                <div className="text-[11px] font-bold text-slate-600 truncate flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-slate-300" />
                                                    {new Date(listing.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        {listing.is_locked ? (
                                            <div className="flex-1 h-11 rounded-xl bg-red-50 text-red-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100 opacity-60 cursor-not-allowed">
                                                <Lock className="w-4 h-4" /> Khóa soạn
                                            </div>
                                        ) : (
                                            <>
                                                <Link
                                                    href={`/dashboard/listings/${listing.id}/edit`}
                                                    className="flex-1 h-11 rounded-xl bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-100 shadow-sm"
                                                >
                                                    <Edit className="w-4 h-4" /> Sửa
                                                </Link>
                                                <VisibilityToggle listingId={listing.id} isHidden={listing.is_hidden} />
                                                {listing.status === 'approved' && (
                                                    <Link
                                                        href={`/listings/${listing.id}`}
                                                        target="_blank"
                                                        className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-all hover:scale-105 hover:bg-black shadow-lg shadow-slate-200"
                                                        title="Xem thực tế"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Highly Refined Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-4">
                            <Link
                                href={page > 1 ? `/dashboard/listings?page=${page - 1}` : '#'}
                                className={`h-12 px-6 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-sm ${page <= 1
                                    ? 'pointer-events-none opacity-40 bg-slate-50 text-slate-400 border border-slate-100'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:shadow-md'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Trước
                            </Link>

                            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    const isCurrent = page === pageNum;
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={`/dashboard/listings?page=${pageNum}`}
                                            className={`min-w-[40px] h-10 px-3 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isCurrent
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </Link>
                                    );
                                })}
                            </div>

                            <Link
                                href={page < totalPages ? `/dashboard/listings?page=${page + 1}` : '#'}
                                className={`h-12 px-6 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-sm ${page >= totalPages
                                    ? 'pointer-events-none opacity-40 bg-slate-50 text-slate-400 border border-slate-100'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:shadow-md'
                                    }`}
                            >
                                Sau <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
