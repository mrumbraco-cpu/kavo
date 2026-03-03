'use client';

import React from 'react';

interface SearchToolbarProps {
    total: number;
    hasSearched: boolean;
    isLoading: boolean;
    layout: 'split' | 'map' | 'list';
    onLayoutChange: (layout: 'split' | 'map' | 'list') => void;
    onOpenFilters: () => void;
}

export default function SearchToolbar({
    total,
    hasSearched,
    isLoading,
    layout,
    onLayoutChange,
    onOpenFilters
}: SearchToolbarProps) {
    return (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-premium-100 bg-white/80 backdrop-blur-md flex-shrink-0 z-20">
            <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                {hasSearched && (
                    <h1 className="text-base sm:text-lg font-bold text-premium-900 whitespace-nowrap">
                        {total} <span className="text-premium-400 font-medium text-xs sm:text-sm">{total > 1 ? 'kết quả' : 'kết quả'}</span>
                    </h1>
                )}
                {!hasSearched && !isLoading && (
                    <h1 className="text-base sm:text-lg font-bold text-premium-900 truncate">Tìm kiếm</h1>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Mobile Search Button */}
                <button
                    onClick={onOpenFilters}
                    className="lg:hidden flex items-center justify-center w-10 h-10 bg-premium-900 text-white rounded-full transition-transform active:scale-95 shadow-lg shadow-premium-900/20"
                    title="Tìm kiếm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="flex items-center p-1 bg-premium-100 rounded-xl">
                    <button
                        onClick={() => onLayoutChange('map')}
                        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layout === 'map' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        <span className="hidden sm:inline">Bản đồ</span>
                    </button>
                    <button
                        onClick={() => onLayoutChange('split')}
                        className={`hidden lg:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layout === 'split' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                        <span className="hidden sm:inline">Màn hình đôi</span>
                    </button>
                    <button
                        onClick={() => onLayoutChange('list')}
                        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layout === 'list' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span className="hidden sm:inline">Danh sách</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
