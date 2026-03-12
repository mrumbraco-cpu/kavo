'use client';

import { usePathname } from 'next/navigation';
import { useSearch } from '@/lib/context/SearchContext';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const GoongMapViewer = dynamic(() => import('./GoongMapViewer'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#f8fafc]" />
});

export default function PersistentMap() {
    const pathname = usePathname();
    const isSearchPage = pathname === '/search';
    
    const {
        allMarkers,
        globalListings,
        hoveredId,
        setHoveredId,
        layout,
        sidebarWidth,
        hasSearched
    } = useSearch();

    const currentPageIds = useMemo(() => new Set(globalListings.map(l => l.id)), [globalListings]);

    // Only render the map once, and keep it alive
    // Use styling to hide/show and position it
    return (
        <div 
            className={`fixed inset-0 top-16 z-0 transition-opacity duration-500 ${isSearchPage && layout !== 'list' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={!isSearchPage}
        >
            <div className="absolute inset-0">
                <GoongMapViewer
                    allListings={allMarkers}
                    currentPageIds={currentPageIds}
                    hoveredListingId={hoveredId}
                    onHover={setHoveredId}
                    onMarkerClick={setHoveredId}
                    paddingLeft={layout === 'split' ? sidebarWidth : 0}
                    layout={layout}
                />
            </div>
        </div>
    );
}
