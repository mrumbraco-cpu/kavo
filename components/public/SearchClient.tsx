'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearch } from '@/lib/context/SearchContext';
import ListingCard from './ListingCard';
import GoongMapViewer from './GoongMapViewer';
import { SearchIcon, Map as MapIcon, List as ListIcon, Columns2 } from 'lucide-react';

const PAGE_SIZE = 12;

export default function SearchClient() {
    const {
        globalListings,
        total,
        isLoading,
        error,
        hasSearched,
        setModalOpen,
        isInitialized,
        filters,
        executeSearch
    } = useSearch();

    // Auto-trigger search if we have persisted filters
    useEffect(() => {
        if (isInitialized && !hasSearched && !isLoading && filters.province) {
            executeSearch(filters);
        }
    }, [isInitialized, hasSearched, isLoading, filters, executeSearch]);

    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [layout, setLayout] = useState<'split' | 'map' | 'list'>('list');

    // Default layout based on screen size
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            setLayout('split');
        }
    }, []);

    // Pagination: current page slice
    const pageStart = (currentPage - 1) * PAGE_SIZE;
    const pageEnd = pageStart + PAGE_SIZE;
    const currentPageListings = useMemo(() => globalListings.slice(pageStart, pageEnd), [globalListings, pageStart, pageEnd]);
    const currentPageIds = useMemo(() => new Set(currentPageListings.map(l => l.id)), [currentPageListings]);
    const totalPages = Math.ceil(globalListings.length / PAGE_SIZE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setHoveredId(null);
        // Scroll to top of results
        document.getElementById('results-list')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white">
            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar / Search Status */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-premium-100 bg-white/80 backdrop-blur-md flex-shrink-0 z-20">
                    <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                        {hasSearched && (
                            <h1 className="text-base sm:text-lg font-bold text-premium-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                {total} <span className="text-premium-400 font-medium hidden xs:inline">không gian</span>
                            </h1>
                        )}
                        {!hasSearched && !isLoading && (
                            <h1 className="text-base sm:text-lg font-bold text-premium-900 truncate">Tìm kiếm</h1>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setModalOpen(true)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 bg-premium-900 text-white rounded-full transition-transform active:scale-95 shadow-lg shadow-premium-900/20"
                            title="Tìm kiếm"
                        >
                            <SearchIcon className="w-5 h-5" />
                        </button>

                        <div className="flex items-center p-1 bg-premium-100 rounded-xl">
                            <button
                                onClick={() => setLayout('map')}
                                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layout === 'map' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                                    }`}
                            >
                                <MapIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Bản đồ</span>
                            </button>
                            <button
                                onClick={() => setLayout('split')}
                                className={`hidden lg:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layout === 'split' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                                    }`}
                            >
                                <Columns2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Màn hình đôi</span>
                            </button>
                            <button
                                onClick={() => setLayout('list')}
                                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layout === 'list' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                                    }`}
                            >
                                <ListIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Danh sách</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content area */}
                <div className={`flex-1 flex overflow-hidden ${layout === 'split' ? 'flex-col lg:flex-row' : 'flex-col'}`}>
                    {/* Results panel */}
                    <div
                        id="results-list"
                        className={`overflow-y-auto scroll-smooth bg-premium-50/20 transition-all duration-300
                            ${layout === 'list' ? 'w-full flex-1' :
                                layout === 'split' ? 'hidden lg:block lg:w-1/2 lg:shrink-0 border-r border-premium-100' :
                                    'hidden'}`}
                    >
                        {/* Status Views */}
                        {!hasSearched && !isLoading && (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8 animate-fade-in">
                                <div className="w-20 h-20 bg-premium-100 rounded-full flex items-center justify-center mb-6">
                                    <SearchIcon className="w-8 h-8 text-premium-400" />
                                </div>
                                <h3 className="text-xl font-bold text-premium-900 mb-2">Bắt đầu tìm kiếm</h3>
                                <p className="text-premium-500 max-w-xs">
                                    Sử dụng thanh tìm kiếm phía trên để khám phá các không gian workshop, văn phòng, sự kiện...
                                </p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                                <div className="w-10 h-10 border-4 border-premium-100 border-t-premium-900 rounded-full animate-spin" />
                                <p className="text-sm font-semibold text-premium-500">Đang cập nhật kết quả...</p>
                            </div>
                        )}

                        {error && (
                            <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3">
                                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
                                {error}
                            </div>
                        )}

                        {hasSearched && !isLoading && currentPageListings.length === 0 && (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8">
                                <SearchIcon className="w-12 h-12 text-premium-200 mb-4" />
                                <h3 className="text-lg font-bold text-premium-950">Không tìm thấy kết quả</h3>
                                <p className="text-premium-500 text-sm mt-2">
                                    Hãy thử điều chỉnh bộ lọc hoặc mở rộng phạm vi tìm kiếm của bạn.
                                </p>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="mt-6 px-6 py-2.5 bg-premium-900 text-white rounded-full text-sm font-bold shadow-lg shadow-premium-900/10"
                                >
                                    Điều chỉnh bộ lọc
                                </button>
                            </div>
                        )}

                        {/* Listing Cards */}
                        {currentPageListings.length > 0 && (
                            <div className={`p-6 ${layout === 'split'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5'
                                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                }`}>
                                {currentPageListings.map(listing => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        isHighlighted={listing.id === hoveredId}
                                        onHover={setHoveredId}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && !isLoading && (
                            <div className="flex items-center justify-center gap-2 p-8 border-t border-premium-100">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 rounded-xl border border-premium-200 flex items-center justify-center text-premium-600 disabled:opacity-30 hover:bg-premium-50 transition-all cursor-pointer"
                                >
                                    ←
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((page, i, arr) => (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1 ? (
                                        <div key={page} className="flex items-center gap-2">
                                            {i > 0 && arr[i - 1] !== page - 1 && <span className="text-premium-300">...</span>}
                                            <button
                                                onClick={() => handlePageChange(page)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${page === currentPage
                                                    ? 'bg-premium-900 text-white shadow-lg shadow-premium-900/20'
                                                    : 'text-premium-600 hover:bg-premium-50 border border-transparent hover:border-premium-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    ) : null))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 rounded-xl border border-premium-200 flex items-center justify-center text-premium-600 disabled:opacity-30 hover:bg-premium-50 transition-all cursor-pointer"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Map panel */}
                    <div className={`relative bg-premium-100 transition-all duration-300 min-w-0 overflow-hidden
                        ${layout === 'map' ? 'w-full flex-1' :
                            layout === 'split' ? 'hidden lg:block lg:flex-1' :
                                'hidden'}`}
                    >
                        <GoongMapViewer
                            allListings={globalListings}
                            currentPageIds={currentPageIds}
                            hoveredListingId={hoveredId}
                            onMarkerClick={setHoveredId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
