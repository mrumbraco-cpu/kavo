'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearch } from '@/lib/context/SearchContext';
import dynamic from 'next/dynamic';
import ListingCard from './ListingCard';
import ListingCardSkeleton from './ListingCardSkeleton';
import { Listing } from '@/types/listing';


import SearchToolbar from './SearchToolbar';
import SearchResults from './SearchResults';
import PublicFooter from '@/components/public/PublicFooter';

const GoongMapViewer = dynamic(() => import('./GoongMapViewer'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-premium-100 animate-pulse flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-premium-200 border-t-premium-900 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-premium-400">Đang tải bản đồ…</p>
            </div>
        </div>
    )
});

const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_LISTINGS_PER_PAGE || 12);

interface SearchClientProps {
    ssrListings?: Listing[];
    ssrMarkers?: Listing[];
    ssrTotal?: number;
}

export default function SearchClient({ ssrListings = [], ssrMarkers = [], ssrTotal = 0 }: SearchClientProps) {
    const {
        globalListings: listings,
        allMarkers,
        total,
        isLoading,
        error,
        hasSearched: contextHasSearched,
        setModalOpen,
        isInitialized,
        filters,
        executeSearch
    } = useSearch();

    // SSR fallback Logic
    const displayListings = (listings.length > 0 || contextHasSearched) ? listings : ssrListings;
    const displayMarkers = (allMarkers.length > 0 || contextHasSearched) ? allMarkers : ssrMarkers;
    const displayTotal = (total > 0 || contextHasSearched) ? total : ssrTotal;
    const hasSearched = contextHasSearched || (ssrListings.length > 0);

    // Filter sync
    useEffect(() => {
        if (isInitialized && !hasSearched && !isLoading && filters.province && ssrListings.length === 0) {
            executeSearch(filters);
        }
    }, [isInitialized, hasSearched, isLoading, filters, executeSearch, ssrListings.length]);

    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [layout, setLayout] = useState<'split' | 'map' | 'list'>('split'); // Default to split for desktop stability
    const [mapActivated, setMapActivated] = useState(false);

    // Initial visible count should be PAGE_SIZE to avoid layout shift (CLS)
    const visibleCount = PAGE_SIZE;

    // Set initial layout based on window size.
    // We use split as default to avoid jump on desktop, and only switch to list if on mobile.
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setLayout('list');
        }
    }, []);

    // Activate map if layout is not 'list', with a slight deferral to reduce TBT
    useEffect(() => {
        if (layout !== 'list' && !mapActivated) {
            const timer = setTimeout(() => {
                setMapActivated(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [layout, mapActivated]);

    // Prevent double scrollbars: hide outer body scroll on all devices for the search page.
    // The footer will be rendered inside the scrollable results-list.
    useEffect(() => {
        const handleResize = () => {
            // Block scroll entirely on body so it acts like an app layout (100vh)
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.remove('hide-outer-scrollbar');
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    // Pagination
    const currentPageIds = useMemo(() => new Set(displayListings.map(l => l.id)), [displayListings]);
    const totalPages = Math.ceil(displayTotal / PAGE_SIZE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setHoveredId(null);
        executeSearch(filters, page);
        document.getElementById('results-list')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)] overflow-hidden bg-white">
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <SearchToolbar
                    total={displayTotal}
                    hasSearched={hasSearched}
                    isLoading={isLoading}
                    province={filters.province}
                    layout={layout}
                    onLayoutChange={setLayout}
                    onOpenFilters={() => setModalOpen(true)}
                />

                <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
                    <div
                        id="results-list"
                        className={`flex-1 overflow-y-auto scroll-smooth bg-premium-50/20 transition-all duration-300 scrollbar-subtle mobile-safe-padding lg:pb-0
                            ${layout === 'map' ? 'hidden' :
                                layout === 'list' ? 'w-full' :
                                    'w-full lg:w-1/2 lg:shrink-0 border-r border-premium-100'}`}
                    >
                        <SearchResults
                            listings={displayListings}
                            visibleCount={visibleCount}
                            isLoading={isLoading}
                            hasSearched={hasSearched}
                            isInitialized={isInitialized}
                            filters={filters}
                            error={error}
                            layout={layout}
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                            onOpenFilters={() => setModalOpen(true)}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        <div className="hidden lg:block border-t border-premium-100 bg-white">
                            <PublicFooter />
                        </div>
                    </div>

                    <div className={`relative bg-premium-100 transition-all duration-300 min-w-0 overflow-hidden
                        ${layout === 'list' ? 'hidden' :
                            layout === 'map' ? 'w-full flex-1' :
                                'hidden lg:block lg:flex-1'}`}
                    >
                        {mapActivated && (
                            <GoongMapViewer
                                allListings={displayMarkers}
                                currentPageIds={currentPageIds}
                                hoveredListingId={hoveredId}
                                onMarkerClick={setHoveredId}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
