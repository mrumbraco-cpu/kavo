'use client';

import { useSearch } from '@/lib/context/SearchContext';
import Link from 'next/link';

export default function ListingMobileFilterBar() {
    const { setModalOpen } = useSearch();

    return (
        <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-white sticky top-[64px] z-40">
            <Link
                href="/search"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                title="Quay lại"
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Quay lại</span>
            </Link>

            <button
                onClick={() => setModalOpen(true)}
                className="flex items-center justify-center gap-1.5 h-8 px-3 border border-gray-200 text-premium-600 rounded-lg hover:bg-premium-50 transition-all active:scale-95 bg-white text-xs font-bold"
                title="Tìm kiếm không gian khác"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Tìm kiếm</span>
            </button>
        </div>
    );
}
