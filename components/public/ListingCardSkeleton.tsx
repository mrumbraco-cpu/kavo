'use client';

export default function ListingCardSkeleton({ layout = 'list' }: { layout?: 'grid' | 'split' | 'list' | 'map' }) {
    const isGrid = layout === 'grid';
    return (
        <div className={`animate-pulse bg-white transition-all duration-300 ${
            isGrid 
                ? 'flex flex-col rounded-2xl border border-premium-100 h-full overflow-hidden' 
                : 'flex flex-row gap-4 px-4 py-4 border-b border-gray-100 last:border-b-0'
        }`}>
            {/* Thumbnail placeholder */}
            <div className={`flex-shrink-0 bg-gray-100 transition-all ${
                isGrid ? 'aspect-[4/3] w-full' : 'w-[100px] h-[100px] rounded-xl'
            }`} />

            {/* Content placeholder */}
            <div className={`flex-1 min-w-0 flex flex-col ${isGrid ? 'p-4 gap-3' : 'py-1 gap-2'}`}>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded-full w-4/5" />
                    <div className="h-3.5 bg-gray-50 rounded-full w-2/5" />
                </div>
                
                {!isGrid && <div className="h-4 bg-gray-100 rounded-full w-1/4 mt-auto" />}
                
                <div className="space-y-1.5 mt-auto">
                    <div className="h-2.5 bg-gray-50 rounded-full w-1/2" />
                    <div className="h-2.5 bg-gray-50 rounded-full w-2/3" />
                </div>
            </div>
        </div>
    );
}
