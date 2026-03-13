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
}

const ListingCard = memo(function ListingCard({ listing, isHighlighted = false, onHover, priority = false }: ListingCardProps) {
    const thumbnail = listing.images?.[0] ?? null;

    // Yêu cầu: thay đổi thành Hình thức cho thuê
    const rentalModesText = (listing.rental_modes ?? [])
        .map(id => getRentalModeLabel(id))
        .filter(Boolean)
        .join(', ');

    // Dòng 3 – yêu cầu 3: nhãn thời gian thuê ngắn gọn
    const timeLabels = parseTimeSlotLabels(listing.time_slots ?? []);

    // Dòng 4 – yêu cầu 4: nearby_features tags
    const nearbyTags = (listing.nearby_features ?? [])
        .map(id => getNearbyFeatureLabel(id))
        .filter(Boolean);

    return (
        <Link
            href={getListingUrl(listing)}
            className={`group flex flex-row gap-3 px-4 py-3.5 transition-all duration-150 cursor-pointer border-b border-gray-100 last:border-b-0 ${isHighlighted ? 'bg-blue-50/60' : 'bg-white hover:bg-gray-50'
                }`}
            onMouseEnter={() => onHover?.(listing.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Thumbnail – vuông bên trái */}
            <div className="relative flex-shrink-0 w-[88px] h-[88px] rounded-xl overflow-hidden bg-slate-50 border border-gray-100/50">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={listing.title}
                        fill
                        priority={priority}
                        quality={75}
                        className={`object-cover group-hover:scale-105 transition-transform duration-700 ease-out-expo ${listing.status === 'expired' ? 'grayscale opacity-75' : ''
                            }`}
                        sizes="88px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/80">
                        {/* Abstract Neutral Placeholder */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                             style={{ backgroundImage: `radial-gradient(#000 0.5px, transparent 0.5px)`, backgroundSize: '8px 8px' }} 
                        />
                        <svg className="w-8 h-8 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75m3-3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                        </svg>
                    </div>
                )}

                {/* Verified badge */}
                {listing.status === 'approved' && (
                    <div className="absolute bottom-1.5 left-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content – bên phải */}
            <div className="flex-1 min-w-0 flex flex-col pt-1 gap-[2px]">

                {/* 1. Title – 1 dòng, to hơn và nhạt hơn 1 xíu */}
                <h3 className={`text-[17px] font-medium leading-[24px] truncate transition-colors duration-150 ${isHighlighted ? 'text-blue-700' : 'text-[#5f6368] group-hover:text-blue-600'
                    }`}>
                    {listing.title}
                </h3>

                {/* 2. Giá + thời gian thuê (text màu xám) */}
                <div className="text-[13px] text-[#70757a] truncate leading-[18px] mt-0.5">
                    {listing.price_min > 0 || listing.price_max > 0 ? formatPriceRange(listing.price_min, listing.price_max) : 'Miễn phí'}
                    {timeLabels.length > 0 && (
                        <span> · {timeLabels.join(', ')}</span>
                    )}
                </div>

                {/* 3. Hình thức cho thuê */}
                {rentalModesText && (
                    <div className="text-[13px] text-[#70757a] truncate leading-[18px]">
                        {rentalModesText}
                    </div>
                )}

                {/* 4. Tags nearby_features – dạng text phân tách bởi dấu chấm tròn thay vì dùng các khối màu nặng nề */}
                {nearbyTags.length > 0 && (
                    <div className="text-[13px] text-[#70757a] truncate leading-[18px]">
                        Gần {nearbyTags.join(' · ')}
                    </div>
                )}
            </div>
        </Link>
    );
});

export default ListingCard;
