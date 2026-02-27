'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getListingUrl } from '@/lib/utils/url';
import { Listing } from '@/types/listing';
import { formatPriceRange } from '@/lib/utils/format';

interface ListingCardProps {
    listing: Listing;
    isHighlighted?: boolean;
    onHover?: (id: string | null) => void;
    priority?: boolean;
}

export default function ListingCard({ listing, isHighlighted = false, onHover, priority = false }: ListingCardProps) {
    const thumbnail = listing.images?.[0] ?? null;
    const detailedAddress = listing.detailed_address || '';

    return (
        <Link
            href={getListingUrl(listing)}
            className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:shadow-premium-900/10 hover:-translate-y-1 active:scale-[0.98] cursor-pointer ${isHighlighted
                ? 'border-accent-gold shadow-md shadow-accent-gold/10 ring-1 ring-accent-gold/30 bg-premium-50/30'
                : 'border-premium-100 bg-white hover:border-premium-200'
                }`}
            onMouseEnter={() => onHover?.(listing.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Image */}
            <div className="relative w-full aspect-video bg-premium-50 overflow-hidden">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={listing.title}
                        fill
                        priority={priority}
                        className={`object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${listing.status === 'expired' ? 'grayscale opacity-75' : ''
                            }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-premium-100/50">
                        <svg className="w-12 h-12 text-premium-200" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                )}

                {/* Glassy Overlay for Space Type */}
                {listing.space_type && listing.space_type.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {listing.space_type.slice(0, 2).map((type, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white/90 text-premium-400 text-[10px] font-medium rounded-lg backdrop-blur-md shadow-sm">
                                {type}
                            </span>
                        ))}
                        {listing.space_type.length > 2 && (
                            <span className="px-2 py-1 bg-white/90 text-premium-400 text-[10px] font-medium rounded-lg backdrop-blur-md shadow-sm">
                                +{listing.space_type.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {/* Gradient overlay for text protection */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col gap-3 flex-1">
                <h3 className="font-semibold text-premium-800 text-[13.5px] leading-snug line-clamp-2 group-hover:text-accent-gold transition-colors duration-300">
                    {listing.title}
                </h3>

                {detailedAddress && (
                    <div className="flex items-center gap-1.5 text-premium-400">
                        <div className="p-1 rounded-md bg-premium-50 group-hover:bg-premium-100 transition-colors">
                            <svg className="w-3 h-3 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-medium truncate">
                            Gần {detailedAddress}
                        </span>
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-premium-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        {listing.price_min > 0 || listing.price_max > 0 ? (
                            <span className="text-sm font-bold text-premium-700">
                                {formatPriceRange(listing.price_min, listing.price_max)}
                            </span>
                        ) : (
                            <span className="text-sm font-bold text-[#10b981]">Miễn phí</span>
                        )}
                    </div>
                    {listing.location_type && (
                        <div className="px-2 py-1 bg-premium-100/70 text-premium-400 text-[10px] font-medium rounded-md">
                            {listing.location_type}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
