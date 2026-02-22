import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/types/listing';

interface ListingCardProps {
    listing: Listing;
    isHighlighted?: boolean;
    onHover?: (id: string | null) => void;
}

function formatPrice(min: number, max: number): string {
    const fmt = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}tr`;
        if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
        return `${n}`;
    };
    if (min === max) return `${fmt(min)} ₫`;
    return `${fmt(min)} – ${fmt(max)} ₫`;
}

export default function ListingCard({ listing, isHighlighted = false, onHover }: ListingCardProps) {
    const thumbnail = listing.images?.[0] ?? null;
    const detailedAddress = listing.detailed_address || '';

    return (
        <Link
            href={`/listings/${listing.id}`}
            className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg cursor-pointer ${isHighlighted
                ? 'border-accent-gold shadow-md shadow-accent-gold/10 ring-1 ring-accent-gold/30'
                : 'border-premium-100 bg-white hover:border-premium-200'
                }`}
            onMouseEnter={() => onHover?.(listing.id)}
            onMouseLeave={() => onHover?.(null)}
        >
            {/* Image */}
            <div className="relative w-full aspect-[4/3] bg-premium-50 overflow-hidden">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-premium-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                )}
                {/* Space type badge */}
                {listing.space_type && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                            {listing.space_type}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-semibold text-premium-900 text-sm leading-snug line-clamp-2 group-hover:text-premium-700 transition-colors">
                    {listing.title}
                </h3>

                {detailedAddress && (
                    <div className="flex items-center gap-1 text-premium-400">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs truncate">
                            {detailedAddress}
                        </span>
                    </div>
                )}

                <div className="mt-auto pt-2 border-t border-premium-50 flex items-center justify-between">
                    {listing.price_min > 0 || listing.price_max > 0 ? (
                        <span className="text-sm font-bold text-premium-900">
                            {formatPrice(listing.price_min, listing.price_max)}
                        </span>
                    ) : (
                        <span className="text-sm text-premium-400 italic">Thương lượng</span>
                    )}
                    {listing.location_type && (
                        <span className="text-xs text-premium-400">{listing.location_type}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
