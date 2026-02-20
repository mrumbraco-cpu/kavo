'use client';

import { useSearch } from '@/lib/context/SearchContext';
import { usePathname } from 'next/navigation';
import {
    MapPin,
    SlidersHorizontal
} from 'lucide-react';

export default function HeaderSearch() {
    const { filters, setModalOpen } = useSearch();
    const pathname = usePathname();

    if (pathname !== '/search') return null;

    return (
        <div className="hidden lg:flex items-center p-1 bg-premium-50 border border-premium-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-4 px-5 py-2.5 bg-white rounded-xl shadow-sm border border-premium-100 hover:border-premium-900 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-3 pr-4 border-r border-premium-100">
                    <MapPin className="w-4 h-4 text-premium-400 group-hover:text-premium-900 transition-colors" />
                    <div className="text-left">
                        <div className="text-[9px] font-black text-premium-400 uppercase tracking-widest leading-none mb-0.5">Khu vực</div>
                        <div className="text-xs font-bold text-premium-900 truncate max-w-[150px]">
                            {filters.province ? (
                                filters.district || filters.ward ? `${filters.district || filters.ward}, ${filters.province}` : filters.province
                            ) : 'Toàn quốc'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-left">
                        <div className="text-[9px] font-black text-premium-400 uppercase tracking-widest leading-none mb-0.5">Tìm kiếm</div>
                        <div className="text-xs font-bold text-premium-600 truncate max-w-[180px]">
                            {filters.query || 'Loại hình, tiện ích...'}
                        </div>
                    </div>
                    <div className="p-1.5 bg-premium-900 text-white rounded-lg group-hover:bg-black transition-colors">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                </div>
            </button>
        </div>
    );
}
