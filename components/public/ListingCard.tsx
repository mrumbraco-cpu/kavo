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
            <div className="relative flex-shrink-0 w-[88px] h-[88px] rounded-xl overflow-hidden bg-gray-100">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={listing.title}
                        fill
                        priority={priority}
                        quality={75}
                        className={`object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${listing.status === 'expired' ? 'grayscale opacity-75' : ''
                            }`}
                        sizes="88px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg className="w-8 h-8 text-gray-300" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

                {/* 1. Title – 1 dòng, font mỏng, to hơn */}
                <h3 className={`text-[15px] font-medium leading-[20px] truncate transition-colors duration-150 ${isHighlighted ? 'text-blue-700' : 'text-[#202124] group-hover:text-blue-600'
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
