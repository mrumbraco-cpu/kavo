'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getListingUrl } from '@/lib/utils/url';
import { Listing } from '@/types/listing';
import { formatPriceRange } from '@/lib/utils/format';
import { getNearbyFeatureLabel } from '@/lib/constants/facilities';
import { getRentalModeLabel } from '@/lib/constants/listing-options';

// Keyword xuất hiện ở phần tử CUỐI cùng sau split '|'
// Ví dụ: "daily|Sáng" → "Sáng" | "single|2026-03-10|Sáng" → "Sáng"
const TIME_KEYWORD_LABEL: Record<string, string> = {
    'Sáng': 'Buổi sáng',
    'Trưa': 'Buổi trưa',
    'Chiều': 'Buổi chiều',
    'Tối': 'Buổi tối',
    'Cả ngày': 'Cả ngày',
};

/** Trích xuất nhãn thời gian ngắn gọn, không trùng, từ mảng time_slots */
function parseTimeSlotLabels(timeSlots: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const slot of timeSlots) {
        const parts = slot.split('|');
        const keyword = parts[parts.length - 1]?.trim();
        if (keyword && TIME_KEYWORD_LABEL[keyword] && !seen.has(keyword)) {
            seen.add(keyword);
            result.push(TIME_KEYWORD_LABEL[keyword]);
        }
    }
    return result;
}

interface ListingCardProps {
    listing: Listing;
    isHighlighted?: boolean;
    onHover?: (id: string | null) => void;
    priority?: boolean;
    viewMode?: 'list' | 'grid';
}

const ListingCard = memo(function ListingCard({ 
    listing, 
    isHighlighted = false, 
    onHover, 
    priority = false,
    viewMode = 'list'
}: ListingCardProps) {
    const thumbnail = listing.images?.[0] ?? null;
    const isGrid = viewMode === 'grid';

    const rentalModesText = (listing.rental_modes ?? [])
        .map(id => getRentalModeLabel(id))
        .filter(Boolean)
        .join(', ');

    const timeLabels = parseTimeSlotLabels(listing.time_slots ?? []);
    const nearbyTags = (listing.nearby_features ?? [])
        .map(id => getNearbyFeatureLabel(id))
        .filter(Boolean);

    return (
        <Link
            href={getListingUrl(listing)}
            className={`group transition-all duration-300 cursor-pointer overflow-hidden ${
                isGrid 
                    ? `flex flex-col rounded-2xl border border-premium-100 hover:border-premium-200 hover:shadow-xl hover:shadow-black/5 ${isHighlighted ? 'ring-2 ring-premium-900 bg-premium-50/30' : 'bg-white'}`
                    : `flex flex-row gap-4 px-4 py-4 border-b border-gray-100 last:border-b-0 ${isHighlighted ? 'bg-premium-50/60' : 'bg-white hover:bg-gray-50/80'}`
            }`}
            onMouseEnter={() => onHover?.(listing.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Thumbnail */}
            <div className={`relative flex-shrink-0 overflow-hidden bg-gray-100 transition-all duration-500 ease-out ${
                isGrid 
                    ? 'aspect-[4/3] w-full' 
                    : 'w-[100px] h-[100px] rounded-xl'
            }`}>
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={listing.title}
                        fill
                        priority={priority}
                        quality={80}
                        className={`object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out ${
                            listing.status === 'expired' ? 'grayscale opacity-75' : ''
                        }`}
                        sizes={isGrid ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : "100px"}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                        <svg className="w-10 h-10" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                )}

                {/* Status Badges Overlay - Always premium */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                    {listing.status === 'approved' && (
                        <div className="bg-emerald-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 scale-90 origin-left">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Xác minh</span>
                        </div>
                    )}
                </div>

                {/* Price Overlay for Grid - More modern */}
                {isGrid && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                         <div className="text-white font-bold text-lg drop-shadow-md">
                            {listing.price_min > 0 || listing.price_max > 0 ? formatPriceRange(listing.price_min, listing.price_max) : 'Miễn phí'}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className={`flex-1 min-w-0 flex flex-col ${isGrid ? 'p-4 gap-2' : 'pt-1 gap-1'}`}>
                {/* Title */}
                <h3 className={`font-semibold transition-colors duration-300 line-clamp-2 ${
                    isGrid 
                        ? 'text-lg text-premium-900 group-hover:text-blue-600' 
                        : `text-[17px] leading-[22px] ${isHighlighted ? 'text-blue-700' : 'text-premium-800 group-hover:text-blue-600'}`
                }`}>
                    {listing.title}
                </h3>

                {/* Details (Price + Time) - Different for styles */}
                {!isGrid && (
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[15px] font-bold text-premium-900 group-hover:text-blue-600 transition-colors">
                            {listing.price_min > 0 || listing.price_max > 0 ? formatPriceRange(listing.price_min, listing.price_max) : 'Miễn phí'}
                        </span>
                        {timeLabels.length > 0 && (
                            <span className="text-[13px] text-premium-500">
                                · {timeLabels.join(', ')}
                            </span>
                        )}
                    </div>
                )}

                {/* Secondary Info */}
                <div className="flex flex-col gap-0.5">
                    {isGrid && timeLabels.length > 0 && (
                        <div className="text-[13px] text-premium-600 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeLabels.join(', ')}
                        </div>
                    )}

                    {rentalModesText && (
                        <div className="text-[13px] text-premium-500 line-clamp-1 flex items-center gap-1.5">
                            {!isGrid && <svg className="w-3.5 h-3.5 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>}
                            {rentalModesText}
                        </div>
                    )}

                    {nearbyTags.length > 0 && (
                        <div className="text-[13px] text-premium-500 line-clamp-1 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Gần {nearbyTags.join(' · ')}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});

export default ListingCard;
