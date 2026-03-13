'use client';

import React from 'react';
import ListingCard from './ListingCard';
import ListingCardSkeleton from './ListingCardSkeleton';
import { Listing } from '@/types/listing';

interface SearchResultsProps {
    listings: Listing[];
    visibleCount: number;
    isLoading: boolean;
    hasSearched: boolean;
    isInitialized: boolean;
    filters: any;
    error: string | null;
    layout: 'split' | 'map' | 'list';
    hoveredId: string | null;
    onHover: (id: string | null) => void;
    onOpenFilters: () => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function SearchResults({
    listings,
    visibleCount,
    isLoading,
    hasSearched,
    isInitialized,
    filters,
    error,
    layout,
    hoveredId,
    onHover,
    onOpenFilters,
    currentPage,
    totalPages,
    onPageChange
}: SearchResultsProps) {
    if (!hasSearched && !isLoading && !filters.province) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8 animate-fade-in">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1.5">Bắt đầu tìm kiếm</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                    <span className="hidden lg:inline">Sử dụng thanh tìm kiếm phía trên</span>
                    <span className="inline lg:hidden">Mở bộ lọc bên dưới</span>
                    {' '}để khám phá các vị trí đang chia sẻ.
                </p>
                <button
                    onClick={onOpenFilters}
                    className="mt-5 px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    <span className="hidden lg:inline">Điều chỉnh bộ lọc</span>
                    <span className="lg:hidden">Bộ lọc tìm kiếm</span>
                </button>
            </div>
        );
    }

    const gridClasses = layout === 'split'
        ? 'grid grid-cols-2 lg:w-[45vw] bg-slate-50 gap-5 p-5 content-start'
        : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 bg-slate-50 gap-5 p-5 content-start';

    if ((isLoading || (isInitialized && filters.province && !hasSearched))) {
        return (
            <div className={gridClasses}>
                {Array.from({ length: 10 }).map((_, i) => (
                    <ListingCardSkeleton key={i} layout={layout} noBorder />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
                {error}
            </div>
        );
    }

    if (hasSearched && !isLoading && listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8">
                <svg className="w-10 h-10 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Không tìm thấy kết quả</h3>
                <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
                    Hãy thử điều chỉnh bộ lọc hoặc mở rộng phạm vi tìm kiếm.
                </p>
                <button
                    onClick={onOpenFilters}
                    className="mt-5 px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    Điều chỉnh bộ lọc
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Results list – Grid layout with responsive columns */}
            <div className={gridClasses}>
                {listings.slice(0, visibleCount).map((listing, index) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        isHighlighted={listing.id === hoveredId}
                        onHover={onHover}
                        priority={index < 4}
                        noBorder
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
                <div className="flex items-center justify-center gap-1.5 py-6 border-t border-gray-100">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all text-sm cursor-pointer"
                    >
                        ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, i, arr) => (
                            <div key={page} className="flex items-center gap-1.5">
                                {i > 0 && arr[i - 1] !== page - 1 && <span className="text-gray-300 text-sm">…</span>}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer ${page === currentPage
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    {page}
                                </button>
                            </div>
                        ))}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all text-sm cursor-pointer"
                    >
                        →
                    </button>
                </div>
            )}
        </>
    );
}
