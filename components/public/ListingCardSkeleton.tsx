'use client';

export default function ListingCardSkeleton({ 
    layout = 'split',
    noBorder = false
}: { 
    layout?: 'grid' | 'split' | 'list' | 'map',
    noBorder?: boolean
}) {
    return (
        <div className="flex flex-col h-full animate-pulse bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            {/* Thumbnail placeholder - 16:9 */}
            <div className="w-full aspect-video bg-gray-100" />

            {/* Content placeholder */}
            <div className="p-4 flex flex-col gap-3">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
                
                <div className="flex justify-between items-center mt-1">
                    <div className="h-5 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/5" />
                </div>

                <div className="h-px bg-gray-100 my-1" />

                <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}

