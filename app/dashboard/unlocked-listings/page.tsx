import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Unlock, MapPin, Search } from 'lucide-react'
import ListingCard from '@/components/public/ListingCard'
import { Listing } from '@/types/listing'


export default async function UnlockedListingsPage() {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Fetch unlocked listings
    const { data: unlockedItems } = await supabase
        .from('contact_unlocks')
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
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">Unlocked</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Tin đã mở khóa
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Danh sách các không gian bạn đã mở khóa thông tin liên hệ
                    </p>
                </div>
            </div>

            {!unlockedItems || unlockedItems.length === 0 ? (
                <div className="mx-4 sm:mx-0 p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Unlock className="w-10 h-10 text-blue-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có tin đăng nào</h3>
                    <p className="text-slate-400 max-w-sm mb-8 font-medium">Bạn chưa mở khóa liên hệ của không gian nào. </p>
                    <Link
                        href="/"
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-100 hover:bg-black transition-all"
                    >
                        Khám phá ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                    {unlockedItems.map((item: any) => {
                        const listing = item.listings as Listing

                        if (!listing) return null

                        return (
                            <div key={`${item.listing_id}-${item.created_at}`} className="relative group/unlocked overflow-visible">
                                <ListingCard listing={listing} />

                                {/* Overlay Unlocked Badge */}
                                <div className="absolute top-3 right-3 z-10">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm text-white rounded-xl shadow-xl border border-white/20">
                                        <Unlock className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Đã mở khóa</span>
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
