import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Trash2 } from 'lucide-react'
import RemoveFavoriteButton from '@/components/dashboard/RemoveFavoriteButton'

function formatCurrency(amount: number) {
    if (typeof amount !== 'number') return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default async function FavoritesPage() {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Fetch favorites with listing details
    const { data: favorites } = await supabase
        .from('favorites')
        .select(`
            listing_id,
            created_at,
            listings (
                id,
                title,
                description,
                images,
                price_min,
                price_max,
                detailed_address,
                status
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tin đăng đã lưu</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Danh sách các không gian bạn quan tâm
                </p>
            </div>

            {!favorites || favorites.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Chưa có tin đăng nào</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Bạn chưa lưu tin đăng nào. Hãy khám phá và lưu những không gian yêu thích!
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
                    >
                        Khám phá ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite: any, index: number) => {
                        const listing = favorite.listings

                        if (!listing) return null

                        return (
                            <div
                                key={favorite.listing_id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-100">
                                    {listing.images && listing.images.length > 0 ? (
                                        <Image
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            priority={index < 3}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <MapPin className="h-12 w-12" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    {listing.status !== 'approved' && (
                                        <div className="absolute top-2 left-2">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-800">
                                                {listing.status === 'pending' ? 'Chờ duyệt' : 'Không khả dụng'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Favorite Icon */}
                                    <div className="absolute top-2 right-2">
                                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors">
                                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <Link
                                        href={`/listings/${listing.id}`}
                                        className="block"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                            {listing.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                        <span className="line-clamp-1">
                                            {listing.detailed_address}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(listing.price_min)} - {formatCurrency(listing.price_max)}
                                        </div>
                                        <RemoveFavoriteButton listingId={listing.id} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
