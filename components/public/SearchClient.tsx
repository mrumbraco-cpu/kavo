'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/lib/context/SearchContext';
import { Listing } from '@/types/listing';

import SearchToolbar from './SearchToolbar';
import SearchResults from './SearchResults';
import PublicFooter from '@/components/public/PublicFooter';

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
        executeSearch,
        layout,
        setLayout,
        isMapExpanded,
        setIsMapExpanded,
        sidebarWidth,
        setSidebarWidth,
        hoveredId,
        setHoveredId
    } = useSearch();

    // SSR fallback Logic
    const displayListings = (listings.length > 0 || contextHasSearched) ? listings : ssrListings;
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
    }, [layout, isMapExpanded, setSidebarWidth]);
    
    // Initial visible count should be PAGE_SIZE to avoid layout shift (CLS)
    const visibleCount = PAGE_SIZE;

    const [canExpand, setCanExpand] = useState(true);

    // Prevent double scrollbars: hide outer body scroll on all devices for the search page.
    useEffect(() => {
        const handleResize = () => {
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
    }, [layout, setIsMapExpanded]);

    const handleResultsListMouseEnter = () => {
        setIsMapExpanded(false);
        setCanExpand(true);
    };

    return (
        <div
            className="flex h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)] overflow-hidden bg-transparent"
        >
            <div className="flex-1 flex flex-col overflow-hidden relative">
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
                        className={`absolute inset-0 z-0 h-full w-full bg-transparent overflow-hidden
                        ${layout === 'list' ? 'hidden' : 'block'}`}
                        onMouseEnter={() => {
                            if (layout === 'split' && canExpand) {
                                setIsMapExpanded(true);
                                setCanExpand(false);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
