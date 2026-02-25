import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Trash2, Search } from 'lucide-react'
import RemoveFavoriteButton from '@/components/dashboard/RemoveFavoriteButton'
import ListingCard from '@/components/public/ListingCard'
import { Listing } from '@/types/listing'

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
                status,
                space_type,
                location_type,
                is_hidden,
                is_locked,
                created_at
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="mb-10 px-4 sm:px-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 text-[10px] font-black uppercase tracking-widest">Favorites</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Tin đăng đã lưu
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Những không gian bạn đã lưu để xem lại sau
                    </p>
                </div>
            </div>

            {!favorites || favorites.length === 0 ? (
                <div className="mx-4 sm:mx-0 p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-pink-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có tin đăng nào</h3>
                    <p className="text-slate-400 max-w-sm mb-8 font-medium">Bạn chưa lưu tin đăng nào. Hãy khám phá và lưu những không gian yêu thích!</p>
                    <Link
                        href="/"
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-100 hover:bg-black transition-all"
                    >
                        Khám phá ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                    {favorites.map((favorite: any) => {
                        const listing = favorite.listings as Listing

                        if (!listing) return null

                        return (
                            <div key={listing.id} className="relative group/fav overflow-visible">
                                <ListingCard listing={listing} />

                                {/* Overlay remove button */}
                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/fav:opacity-100 transition-opacity">
                                    <div className="p-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/50">
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
