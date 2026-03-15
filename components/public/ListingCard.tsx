'use client';
import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getListingUrl } from '@/lib/utils/url';
import { Listing } from '@/types/listing';
import { formatPriceRange } from '@/lib/utils/format';
import { getNearbyFeatureLabel, getAmenityLabel } from '@/lib/constants/facilities';
import { getRentalModeLabel } from '@/lib/constants/listing-options';

const TIME_KEYWORD_LABEL: Record<string, string> = {
    'Sáng': 'Buổi sáng',
    'Trưa': 'Buổi trưa',
    'Chiều': 'Buổi chiều',
    'Tối': 'Buổi tối',
    'Cả ngày': 'Cả ngày',
};

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
    noBorder?: boolean;
}

const ListingCard = memo(function ListingCard({ 
    listing, 
    isHighlighted = false, 
    onHover, 
    priority = false,
    noBorder = false 
}: ListingCardProps) {
    const thumbnail = listing.images?.[0] ?? null;

    const rentalModes = (listing.rental_modes ?? [])
        .map(id => ({ id, label: getRentalModeLabel(id) }))
        .filter(item => item.label);

    const timeLabels = parseTimeSlotLabels(listing.time_slots ?? []);

    const nearbyTags = (listing.nearby_features ?? [])
        .map(id => getNearbyFeatureLabel(id))
        .filter(Boolean);

    const amenityTags = (listing.amenities ?? [])
        .map(id => getAmenityLabel(id))
        .filter(Boolean);

    const priceDisplay = formatPriceRange(listing.price_min, listing.price_max);
    const isFree = priceDisplay === 'Miễn phí';

    return (
        <Link
            href={getListingUrl(listing)}
            className={`group flex flex-col h-full transition-all duration-300 cursor-pointer overflow-hidden rounded-xl border ${
                isHighlighted 
                    ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-100' 
                    : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
            }`}
            onMouseEnter={() => onHover?.(listing.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Image Section - Matching Map Popup Aspect Ratio (16/9) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden" 
                 style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={listing.title}
                        fill
                        priority={priority}
                        quality={75}
                        className={`object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${listing.status === 'expired' ? 'grayscale opacity-75' : ''}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/80">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                             style={{ backgroundImage: `radial-gradient(#000 0.5px, transparent 0.5px)`, backgroundSize: '8px 8px' }} 
                        />
                        <svg className="w-12 h-12 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75m3-3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                        </svg>
                    </div>
                )}

                {/* Badges on overlay (top left) - Matching Map Popup design */}
                {rentalModes.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {rentalModes.slice(0, 3).map((mode) => (
                            <span 
                                key={mode.id}
                                className="px-2 py-0.5 bg-white/95 text-slate-600 text-[9px] font-bold rounded uppercase tracking-wider shadow-sm border border-gray-100"
                            >
                                {mode.label}
                            </span>
                        ))}
                        {rentalModes.length > 3 && (
                            <span className="px-2 py-0.5 bg-white/95 text-slate-600 text-[9px] font-bold rounded shadow-sm border border-gray-100">
                                +{rentalModes.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Verified badge - Bottome right of image */}
                {listing.status === 'approved' && (
                    <div className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-3.5 flex flex-col gap-1.5">
                {/* 1. Title - Minimalist clean typography */}
                <h3 className={`text-[14px] font-medium leading-normal line-clamp-2 min-h-[2.8em] transition-colors duration-200 ${
                    isHighlighted ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'
                    }`}>
                    {listing.title}
                </h3>

                {/* 2. Primary Details - Clean price display */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-[14px] font-bold ${isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {priceDisplay}
                    </span>
                    {timeLabels.length > 0 && (
                        <span className="text-[11px] text-slate-400 font-normal">
                            {timeLabels[0]}
                        </span>
                    )}
                </div>

                {/* 3. Secondary Data - Clean icons and smaller text */}
                <div className="flex flex-col gap-1 mt-1 border-t border-gray-50 pt-2">
                    {nearbyTags.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="truncate opacity-80">Gần {nearbyTags.join(' · ')}</span>
                        </div>
                    )}
                    
                    {amenityTags.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="truncate opacity-80 italic">Có {amenityTags.slice(0, 2).join(', ')}{amenityTags.length > 2 ? '...' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});

export default ListingCard;

