'use client';

import { useListingDetail } from '@/lib/context/ListingDetailContext';
import MiniMap from './MiniMap';

interface Props {
    latitude?: number | null;
    longitude?: number | null;
    fullAddress: string;
}

export default function ListingBottomMap({ latitude, longitude, fullAddress }: Props) {
    const { isTopMapVisible } = useListingDetail();

    if (isTopMapVisible) return null;

    if (!latitude && !longitude && !fullAddress) return null;

    return (
        <div className="py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vị trí trên bản đồ</h2>
            {latitude && longitude && (
                <div className="rounded-2xl overflow-hidden border border-gray-100 mb-4">
                    <MiniMap latitude={latitude} longitude={longitude} />
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
    );
}
