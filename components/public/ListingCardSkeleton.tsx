'use client';

export default function ListingCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'split' | 'list' | 'map' }) {
    return (
        <div className="flex flex-col rounded-2xl overflow-hidden border border-premium-100 bg-white animate-pulse">
            <div className="relative w-full aspect-video bg-premium-100" />
            <div className="p-3 flex flex-col gap-3">
                <div className="h-4 bg-premium-100 rounded w-3/4" />
                <div className="h-3 bg-premium-50 rounded w-1/2" />
                <div className="mt-auto pt-3 border-t border-premium-50 flex items-center justify-between">
                    <div className="h-4 bg-premium-100 rounded w-1/4" />
                    <div className="h-4 bg-premium-50 rounded w-1/4" />
                </div>
            </div>
        </div>
    );
}
