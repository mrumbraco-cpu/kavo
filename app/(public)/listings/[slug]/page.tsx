import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Listing } from '@/types/listing';
import ImageGallery from '@/components/public/ImageGallery';
import Link from 'next/link';
import ContactUnlockBlock from '@/components/public/ContactUnlockBlock';
import { decrypt } from '@/lib/utils/encryption';
import FavoriteButton from '@/components/public/FavoriteButton';
import ShareButton from '@/components/public/ShareButton';
import ReportButton from '@/components/public/ReportButton';
import UrgencyBadge from '@/components/public/UrgencyBadge';
import MiniMap from '@/components/public/MiniMap';
import { getProvinceById, getDistrictById, getWardById } from '@/lib/constants/geography';
import { cache } from 'react';

import { parseListingIdFromSlug, getListingUrl } from '@/lib/utils/url';
import { getAmenityLabel, getNearbyFeatureLabel } from '@/lib/constants/facilities';
import { getSpaceTypeLabel, getLocationTypeLabel, getSuitableLabel, getNotSuitableLabel, getRentalModeLabel } from '@/lib/constants/listing-options';

interface Props {
    params: Promise<{ slug: string }>;
}

const getListing = cache(async (id: string) => {
    const supabase = await createServerSupabaseClient();
    return await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .eq('is_hidden', false)
        .single();
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const id = parseListingIdFromSlug(slug);
    const { data } = await getListing(id);

    if (!data) return { title: 'Không tìm thấy không gian – CHOBAN.VN' };

    const description = data.description?.slice(0, 160) || `Khám phá và kết nối trực tiếp với không gian "${data.title}" tại CHOBAN.VN. Marketplace kết nối không gian kinh doanh hàng đầu.`;
    const title = `${data.title} | CHOBAN.VN`;
    const url = `https://choban.vn/listings/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            siteName: 'CHOBAN.VN',
        }
    };
}

export default async function ListingDetailPage({ params }: Props) {
    const { slug } = await params;
    const id = parseListingIdFromSlug(slug);
    const supabase = await createServerSupabaseClient();

    // Fetch listing and user in parallel
    const [listingResult, userResult] = await Promise.all([
        getListing(id),
        supabase.auth.getUser()
    ]);

    const { data: listing, error } = listingResult;
    const { data: { user } } = userResult;

    if (error || !listing) notFound();

    const typedListing = listing as Listing;
    const unlockCount = typedListing.unlock_count ?? 0;

    let coinBalance = 0;
    let alreadyUnlocked = false;
    let unlockedPhone: string | undefined;
    let unlockedZalo: string | undefined;
    let isFavorite = false;

    if (user) {
        // Fetch user-specific data in parallel
        const [profileResult, unlockCheckResult, favoriteResult] = await Promise.all([
            supabase
                .from('profiles')
                .select('coin_balance')
                .eq('id', user.id)
                .single(),
            supabase
                .from('contact_unlocks')
                .select('user_id')
                .eq('user_id', user.id)
                .eq('listing_id', id)
                .maybeSingle(),
            supabase
                .from('favorites')
                .select('user_id')
                .eq('user_id', user.id)
                .eq('listing_id', id)
                .maybeSingle()
        ]);

        coinBalance = profileResult.data?.coin_balance ?? 0;
        isFavorite = !!favoriteResult.data;

        const isOwner = user.id === typedListing.owner_id;
        const hasUnlocked = !!unlockCheckResult.data;

        if (hasUnlocked || isOwner) {
            alreadyUnlocked = true;
            // RPC must be done separately after we know we need it,
            // though we could have fetched the raw listing_contacts if we were owner or unlocked.
            // But let's stick to the RPC for security/decoupling.
            const { data: contactData, error: rpcError } = await supabase.rpc('unlock_listing_contact', {
                p_listing_id: id,
            });

            if (rpcError) console.error('Error fetching contact info via RPC:', rpcError);

            if (contactData?.success && contactData.data) {
                try {
                    unlockedPhone = contactData.data.phone_encrypted
                        ? decrypt(contactData.data.phone_encrypted)
                        : undefined;
                    unlockedZalo = contactData.data.zalo_encrypted
                        ? decrypt(contactData.data.zalo_encrypted)
                        : undefined;
                } catch (err) {
                    console.error('Server-side decryption failed:', err);
                }
            }
        }
    }

    const UNLOCK_COST = Number(process.env.NEXT_PUBLIC_CONTACT_UNLOCK_COST || 10);
    const canUnlock = coinBalance >= UNLOCK_COST;
    const threshold = parseInt(process.env.NEXT_PUBLIC_LISTING_UNLOCK_THRESHOLD || '3', 10);

    // Parse and format time slots (same logic as ListingForm)
    const formatTimeSlot = (slot: string): string => {
        const parts = slot.split('|');
        const type = parts[0];
        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-');
            if (!y || !m || !d) return dateStr;
            return `${d}/${m}/${y}`;
        };
        if (type === 'daily') return `Hàng ngày • ${parts[1]}`;
        if (type === 'single') return `Chỉ ngày ${formatDate(parts[1])} • ${parts[2]}`;
        if (type === 'range') return `${formatDate(parts[1])} – ${formatDate(parts[2])} • ${parts[3]}`;
        if (type === 'weekly') return `${parts[1]} hàng tuần • ${parts[2]}`;
        return slot; // fallback for legacy plain text
    };

    const parsedTimeSlots = Array.isArray(typedListing.time_slots)
        ? typedListing.time_slots.map(formatTimeSlot)
        : [];

    const fullAddress = typedListing.detailed_address || '';

    // Amenity icons mapping
    const amenityIcons: Record<string, React.ReactNode> = {
        'Wifi': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
        ),
        'Máy lạnh': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
        ),
        'Chỗ đậu xe': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
        'Nhà vệ sinh': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        'Bồn rửa tay': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        'Bồn rửa chén': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        'Bàn ghế': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M10 14h4M8 18h8" />
            </svg>
        ),
        'Phòng thay đồ': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        'Tủ lạnh': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
        'Ổ cắm điện': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    };

    const defaultAmenityIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

                {/* ── Main 2-column layout ────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-x-14 gap-y-10">

                    {/* ────── LEFT COLUMN ─────────────────────────────── */}
                    <div className="min-w-0">

                        {/* Top Actions */}
                        <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-5">
                            <Link
                                href="/search"
                                className="flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 active:scale-95 rounded-full border border-gray-100 group"
                                title="Quay lại tìm kiếm"
                            >
                                <svg className="w-4 h-4 text-gray-500 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="text-[13px] font-bold text-gray-600 group-hover:text-amber-600">Quay lại</span>
                            </Link>

                            <div className="flex flex-shrink-0 items-center gap-2">
                                <ShareButton title={typedListing.title} />
                                <FavoriteButton
                                    listingId={id}
                                    initialIsFavorite={isFavorite}
                                    isAuthenticated={!!user}
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                            <h1 className="text-2xl sm:text-3xl font-medium text-[#3c4043] leading-tight pr-0 sm:pr-4">
                                {typedListing.title}
                            </h1>
                        </div>

                        {/* Badges + Address */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-5">
                            <div className="flex flex-wrap gap-1.5">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/90 text-white text-[9px] font-black rounded-lg backdrop-blur-md shadow-sm uppercase tracking-tighter transition-all duration-300">
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-600/90 text-white text-[9px] font-black rounded-lg backdrop-blur-md shadow-sm uppercase tracking-tighter transition-all duration-300">
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Còn hiệu lực
                                </span>
                            </div>
                            {typedListing.rental_modes && typedListing.rental_modes.length > 0 && (
                                <div className="flex items-start gap-1.5 text-[14px] text-gray-600 bg-gray-50/80 px-3 py-2 rounded-lg border border-gray-100 sm:bg-transparent sm:px-0 sm:py-0 sm:border-transparent sm:items-center">
                                    <span className="leading-snug">
                                        {typedListing.rental_modes.map(id => getRentalModeLabel(id)).filter(Boolean).join(' · ')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Image Gallery */}
                        <div className="mb-8">
                            <ImageGallery images={typedListing.images ?? []} title={typedListing.title} />
                        </div>

                        {/* Price section */}
                        <div className="pb-8 border-b border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Giá thuê theo buổi</p>
                            {typedListing.price_min > 0 || typedListing.price_max > 0 ? (
                                <p className="text-3xl font-bold text-gray-900">
                                    {typedListing.price_min > 0 && (typedListing.price_max <= 0 || typedListing.price_min === typedListing.price_max)
                                        ? `${typedListing.price_min.toLocaleString('vi-VN')} ₫`
                                        : typedListing.price_min === 0 && typedListing.price_max > 0
                                            ? `Đến ${typedListing.price_max.toLocaleString('vi-VN')} ₫`
                                            : `${typedListing.price_min.toLocaleString('vi-VN')} – ${typedListing.price_max.toLocaleString('vi-VN')} ₫`
                                    }
                                </p>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">Miễn phí</p>
                            )}
                            {parsedTimeSlots.length > 0 && (
                                <div className="mt-3 flex flex-col gap-1.5">
                                    {parsedTimeSlots.map((slot, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">{slot}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Space & Location Details */}
                        <div className="py-8 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="group">
                                <p className="text-[11px] text-premium-400 font-bold uppercase tracking-widest mb-2">Loại hình không gian</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-premium-50 flex items-center justify-center text-premium-900 group-hover:bg-premium-100 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-premium-900 group-hover:text-premium-700 transition-colors">
                                        {typedListing.space_type?.map(id => getSpaceTypeLabel(id)).join(', ')}
                                    </span>
                                </div>
                            </div>
                            <div className="group">
                                <p className="text-[11px] text-premium-400 font-bold uppercase tracking-widest mb-2">Vị trí mặt bằng</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-premium-50 flex items-center justify-center text-premium-900 group-hover:bg-premium-100 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-premium-900 group-hover:text-premium-700 transition-colors">
                                        {getLocationTypeLabel(typedListing.location_type)}
                                    </span>
                                </div>
                            </div>
                            <div className="group">
                                <p className="text-[11px] text-premium-400 font-bold uppercase tracking-widest mb-2">Hình thức cho thuê</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-premium-50 flex items-center justify-center text-premium-900 group-hover:bg-premium-100 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-premium-900 group-hover:text-premium-700 transition-colors">
                                        {typedListing.rental_modes?.map(id => getRentalModeLabel(id)).join(', ') || 'Chưa cập nhật'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {typedListing.description && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả không gian</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
                                    {typedListing.description}
                                </p>
                            </div>
                        )}

                        {/* Amenities */}
                        {typedListing.amenities?.length > 0 && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tiện ích</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {typedListing.amenities?.map((id: string) => (
                                        <div key={id} className="flex flex-col items-center p-3 rounded-2xl bg-premium-50 border border-premium-100 hover:border-premium-200 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-premium-900 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                {amenityIcons[getAmenityLabel(id)] || amenityIcons[id] || defaultAmenityIcon}
                                            </div>
                                            <span className="text-[10px] font-bold text-premium-900 text-center uppercase tracking-wider">{getAmenityLabel(id)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suitable for */}
                        {(typedListing.suitable_for?.length > 0 || typedListing.not_suitable_for?.length > 0) && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Phù hợp</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {typedListing.suitable_for?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Phù hợp với
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {typedListing.suitable_for.map(id => (
                                                    <span key={id} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-100 font-medium">{getSuitableLabel(id)}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {typedListing.not_suitable_for?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Không phù hợp với
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {typedListing.not_suitable_for.map(id => (
                                                    <span key={id} className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-full border border-red-100 font-medium">{getNotSuitableLabel(id)}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Nearby features */}
                        {typedListing.nearby_features?.length > 0 && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Đặc điểm xung quanh</h2>
                                <div className="flex flex-wrap gap-2">
                                    {typedListing.nearby_features.map(id => (
                                        <span key={id} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100 font-medium">{getNearbyFeatureLabel(id)}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mini Map */}
                        {(typedListing.latitude && typedListing.longitude) || fullAddress ? (
                            <div className="py-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vị trí trên bản đồ</h2>
                                {typedListing.latitude && typedListing.longitude && (
                                    <div className="rounded-2xl overflow-hidden border border-gray-100 mb-4">
                                        <MiniMap latitude={typedListing.latitude} longitude={typedListing.longitude} />
                                    </div>
                                )}
                                {fullAddress && (
                                    <div className="flex items-start gap-2 text-[15px] text-gray-600">
                                        <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="leading-relaxed">Gần {fullAddress}</span>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* ────── RIGHT COLUMN (sticky sidebar) ────────────── */}
                    <div className="lg:block">
                        <div className="sticky top-24 flex flex-col gap-4">
                            <UrgencyBadge
                                unlockCount={unlockCount ?? 0}
                                threshold={threshold}
                            />

                            {/* Author Info (Hardcoded) */}
                            <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 relative shrink-0 overflow-hidden">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Người đăng bài</p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-semibold text-gray-900">Người dùng đã xác thực</span>
                                        <div className="flex items-center justify-center p-0.5 bg-blue-500 rounded-full text-white">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ContactUnlockBlock
                                listingId={id}
                                isAuthenticated={!!user}
                                alreadyUnlocked={alreadyUnlocked}
                                initialPhone={unlockedPhone}
                                initialZalo={unlockedZalo}
                                coinBalance={coinBalance}
                                canUnlock={canUnlock}
                            />

                            {/* Disclaimer */}
                            <div className="rounded-2xl border border-gray-100 p-4 text-xs text-gray-400 leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>
                                        <span className="font-semibold text-gray-500">CHOBAN.VN</span> chỉ là kênh kết nối. Mọi thỏa thuận và thanh toán đều diễn ra trực tiếp với chủ không gian.
                                    </p>
                                </div>
                            </div>

                            {/* Report Button */}
                            <div className="flex justify-center">
                                <ReportButton listingId={id} isAuthenticated={!!user} />
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── JSON-LD Structured Data ────────────────────────── */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Accommodation",
                            "name": typedListing.title,
                            "description": typedListing.description,
                            "image": typedListing.images,
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": typedListing.detailed_address,
                                "addressLocality": (typedListing.ward_new ? getWardById(typedListing.province_new, typedListing.ward_new)?.label : getDistrictById(typedListing.province_old, typedListing.district_old)?.label) || '',
                                "addressRegion": (getProvinceById(typedListing.province_new, 'new')?.label || getProvinceById(typedListing.province_old, 'old')?.label) || '',
                                "addressCountry": "VN"
                            },
                            "geo": typedListing.latitude ? {
                                "@type": "GeoCoordinates",
                                "latitude": typedListing.latitude,
                                "longitude": typedListing.longitude
                            } : undefined,
                            "amenityFeature": typedListing.amenities?.map(a => ({
                                "@type": "LocationFeatureSpecification",
                                "name": a,
                                "value": true
                            }))
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Trang chủ",
                                    "item": "https://choban.vn/"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Tìm kiếm",
                                    "item": "https://choban.vn/search"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": typedListing.title,
                                    "item": `https://choban.vn/listings/${slug}`
                                }
                            ]
                        }),
                    }}
                />
            </div>
        </div>
    );
}
