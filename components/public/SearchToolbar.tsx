'use client';

import React from 'react';

interface SearchToolbarProps {
    total: number;
    hasSearched: boolean;
    isLoading: boolean;
    province?: string;
    layout: 'split' | 'map' | 'list';
    onLayoutChange: (layout: 'split' | 'map' | 'list') => void;
    onOpenFilters: () => void;
}

export default function SearchToolbar({
    total,
    hasSearched,
    isLoading,
    province,
    layout,
    onLayoutChange,
    onOpenFilters
}: SearchToolbarProps) {
    return (
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-premium-100 bg-white/80 backdrop-blur-md flex-shrink-0 z-20">
            <div className="flex items-center gap-2 sm:gap-4 overflow-hidden min-w-0 flex-1 mr-4">
                {hasSearched && (
                    <h1 className="text-base sm:text-lg font-bold text-premium-900 truncate">
                        {total} <span className="text-premium-400 font-medium text-xs sm:text-sm">vị trí {province ? `ở ${province}` : ''}</span>
                    </h1>
                )}
                {!hasSearched && !isLoading && (
                    <h1 className="text-base sm:text-lg font-bold text-premium-900 truncate">Tìm kiếm</h1>
                )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 h-9">
                {/* Mobile Filter Button */}
                <button
                    onClick={onOpenFilters}
                    className="lg:hidden flex items-center justify-center gap-2 h-full px-3.5 border border-premium-200 text-premium-700 rounded-xl hover:bg-premium-50 transition-all active:scale-95 shadow-sm bg-white"
                    title="Bộ lọc"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="21" x2="14" y1="4" y2="4" />
                        <line x1="10" x2="3" y1="4" y2="4" />
                        <line x1="21" x2="12" y1="12" y2="12" />
                        <line x1="8" x2="3" y1="12" y2="12" />
                        <line x1="21" x2="16" y1="20" y2="20" />
                        <line x1="12" x2="3" y1="20" y2="20" />
                        <line x1="14" x2="14" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="10" y2="14" />
                        <line x1="16" x2="16" y1="18" y2="22" />
                    </svg>
                    <span className="text-[11px] font-bold tracking-tight">Bộ lọc</span>
                </button>

                <div className="flex items-center p-0.5 bg-premium-100 rounded-xl h-full">
                    <button
                        onClick={() => onLayoutChange('map')}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-full ${layout === 'map' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        <span className="hidden sm:inline">Bản đồ</span>
                    </button>
                    <button
                        onClick={() => onLayoutChange('split')}
                        className={`hidden lg:flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-full ${layout === 'split' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                        <span className="hidden sm:inline">Màn hình đôi</span>
                    </button>
                    <button
                        onClick={() => onLayoutChange('list')}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-full ${layout === 'list' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'
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
