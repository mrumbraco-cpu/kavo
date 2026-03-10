'use client';

export default function ListingCardSkeleton({ layout = 'split' }: { layout?: 'grid' | 'split' | 'list' | 'map' }) {
    return (
        <div className="flex flex-row gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 animate-pulse bg-white">
            {/* Thumbnail placeholder */}
            <div className="flex-shrink-0 w-[88px] h-[88px] rounded-xl bg-gray-100" />

            {/* Content placeholder */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-4/5" />
                    <div className="h-3 bg-gray-100 rounded w-3/5" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                <div className="flex gap-1 mt-1">
                    <div className="h-4 bg-gray-100 rounded-md w-12" />
                    <div className="h-4 bg-gray-100 rounded-md w-16" />
                </div>
            </div>
        </div>
    );
}
