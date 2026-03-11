'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
        <div className="w-full h-full bg-premium-100 animate-pulse flex items-center justify-center lg:pl-[50%]">
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
    initialPage?: number;
}

export default function SearchClient({ ssrListings = [], ssrMarkers = [], ssrTotal = 0, initialPage = 1 }: SearchClientProps) {
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

    const searchParams = useSearchParams();
    const urlPage = useMemo(() => {
        const p = searchParams.get('page');
        return p ? parseInt(p, 10) : initialPage;
    }, [searchParams, initialPage]);

    const [currentPage, setCurrentPage] = useState(urlPage);
    
    // Sync currentPage with URL if it changes (e.g. back navigation or URL update)
    useEffect(() => {
        if (urlPage !== currentPage) {
            setCurrentPage(urlPage);
        }
    }, [urlPage, currentPage]);

    // Filter sync
    useEffect(() => {
        if (isInitialized && !hasSearched && !isLoading && filters.province && ssrListings.length === 0) {
            executeSearch(filters, urlPage);
        }
    }, [isInitialized, hasSearched, isLoading, filters, executeSearch, ssrListings.length, urlPage]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [layout, setLayout] = useState<'split' | 'map' | 'list'>('split');
    const [mapActivated, setMapActivated] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(0);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Track sidebar width for map padding
    useEffect(() => {
        if (!sidebarRef.current || layout !== 'split') {
            setSidebarWidth(0);
            return;
        }

        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                setSidebarWidth(entries[0].contentRect.width);
            }
        });

        observer.observe(sidebarRef.current);
        return () => observer.disconnect();
    }, [layout, isMapExpanded]);
    
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

    // Reset map expansion when layout changes
    useEffect(() => {
        setIsMapExpanded(false);
        setCanExpand(true);
    }, [layout]);

    const handleResultsListMouseEnter = () => {
        // Reset map expansion when hovering back to the listings list
        setIsMapExpanded(false);
        setCanExpand(true);
    };

    return (
        <div
            className="flex h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)] overflow-hidden bg-white"
        >
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* On mobile: only show toolbar after first search or if province is set.
                    On desktop: always show. This prevents the toolbar being hidden under
                    the fixed header on real mobile devices before the viewport is stable. */}
                <div className={`${(!hasSearched && !filters.province) ? 'hidden lg:block' : 'block'}`}>
                    <SearchToolbar
                        total={displayTotal}
                        hasSearched={hasSearched}
                        isLoading={isLoading}
                        province={filters.province}
                        geoSystem={filters.geoSystem}
                        layout={layout}
                        onLayoutChange={setLayout}
                        onOpenFilters={() => setModalOpen(true)}
                    />
                </div>

                <div className="flex-1 flex overflow-hidden lg:flex-row flex-col relative">
                    <div
                        id="results-list"
                        ref={sidebarRef}
                        onMouseEnter={handleResultsListMouseEnter}
                        className={`overflow-y-auto overflow-x-hidden scroll-smooth transition-all duration-500 ease-in-out scrollbar-subtle mobile-safe-padding lg:pb-0 relative z-10
                            ${layout === 'map' ? 'hidden' :
                                layout === 'list' ? 'flex-1 w-full bg-premium-50/20' :
                                    isMapExpanded ? 'w-full lg:w-[30%] lg:flex-none border-r border-premium-100 bg-white shadow-2xl shadow-black/5' :
                                        'w-full lg:w-[50%] lg:flex-none border-r border-premium-100 bg-white shadow-xl shadow-black/5'}`}
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

                    <div
                        className={`absolute inset-0 z-0 h-full w-full bg-premium-100 overflow-hidden
                        ${layout === 'list' ? 'hidden' : 'block'}`}
                        onMouseEnter={() => {
                            if (layout === 'split' && canExpand) {
                                setIsMapExpanded(true);
                                setCanExpand(false);
                            }
                        }}
                    >
                        {mapActivated && (
                            <GoongMapViewer
                                allListings={displayMarkers}
                                currentPageIds={currentPageIds}
                                hoveredListingId={hoveredId}
                                onHover={setHoveredId}
                                onMarkerClick={setHoveredId}
                                paddingLeft={layout === 'split' ? sidebarWidth : 0}
                                layout={layout}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
