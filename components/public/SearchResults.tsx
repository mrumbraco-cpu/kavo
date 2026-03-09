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
                <div className="w-20 h-20 bg-premium-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-premium-900 mb-2">Bắt đầu tìm kiếm</h3>
                <p className="text-premium-500 max-w-xs">
                    <span className="hidden lg:inline">Sử dụng thanh tìm kiếm phía trên</span>
                    <span className="inline lg:hidden">Mở bộ lọc bên dưới</span>
                    {' '}để khám phá các vị trí đang chia sẻ.
                </p>
                <button
                    onClick={onOpenFilters}
                    className="mt-6 px-6 py-2.5 bg-premium-900 text-white rounded-full text-sm font-bold shadow-lg shadow-premium-900/10 cursor-pointer"
                >
                    <span className="hidden lg:inline">Điều chỉnh bộ lọc</span>
                    <span className="lg:hidden">Bộ lọc tìm kiếm</span>
                </button>
            </div>
        );
    }

    if ((isLoading || (isInitialized && filters.province && !hasSearched))) {
        return (
            <div className={`p-6 ${layout === 'split'
                ? 'grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-5'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <ListingCardSkeleton key={i} layout={layout} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
                {error}
            </div>
        );
    }

    if (hasSearched && !isLoading && listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-8">
                <svg className="w-12 h-12 text-premium-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <h3 className="text-lg font-bold text-premium-950">Không tìm thấy kết quả</h3>
                <p className="text-premium-500 text-sm mt-2">
                    Hãy thử điều chỉnh bộ lọc hoặc mở rộng phạm vi tìm kiếm của bạn.
                </p>
                <button
                    onClick={onOpenFilters}
                    className="mt-6 px-6 py-2.5 bg-premium-900 text-white rounded-full text-sm font-bold shadow-lg shadow-premium-900/10"
                >
                    Điều chỉnh bộ lọc
                </button>
            </div>
        );
    }

    return (
        <>
            <div className={`p-6 ${layout === 'split'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                }`}>
                {listings.slice(0, visibleCount).map((listing, index) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        isHighlighted={listing.id === hoveredId}
                        onHover={onHover}
                        priority={index < 2}
                    />
                ))}
            </div>

            {totalPages > 1 && !isLoading && (
                <div className="flex items-center justify-center gap-2 p-8 border-t border-premium-100">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-xl border border-premium-200 flex items-center justify-center text-premium-600 disabled:opacity-30 hover:bg-premium-50 transition-all cursor-pointer"
                    >
                        ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, i, arr) => (
                            <div key={page} className="flex items-center gap-2">
                                {i > 0 && arr[i - 1] !== page - 1 && <span className="text-premium-300">…</span>}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${page === currentPage
                                        ? 'bg-premium-900 text-white shadow-lg shadow-premium-900/20'
                                        : 'text-premium-600 hover:bg-premium-50 border border-transparent hover:border-premium-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            </div>
                        ))}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-xl border border-premium-200 flex items-center justify-center text-premium-600 disabled:opacity-30 hover:bg-premium-50 transition-all cursor-pointer"
                    >
                        →
                    </button>
                </div>
            )}
        </>
    );
}
