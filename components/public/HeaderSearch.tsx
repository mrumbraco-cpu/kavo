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
        <div className="hidden lg:flex items-center">
            <button
                onClick={() => setModalOpen(true)}
                className="flex items-center pl-1.5 pr-2 py-1.5 bg-white border border-premium-100 rounded-full shadow-sm hover:shadow-md hover:border-premium-200 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-2.5 pr-4 border-r border-premium-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white group-hover:bg-premium-50 transition-colors shadow-sm border border-premium-50">
                        <MapPin className="w-3.5 h-3.5 text-premium-600" />
                    </div>
                    <div className="text-left">
                        <div className="text-[9px] font-black text-premium-300 uppercase tracking-widest leading-none mb-0.5">Khu vực</div>
                        <div className="text-xs font-bold text-premium-900 truncate max-w-[130px]">
                            {filters.province ? (
                                (() => {
                                    const subLocations = filters.geoSystem === 'new' ? filters.ward : filters.district;
                                    return subLocations.length > 0
                                        ? `${subLocations.join(', ')}, ${filters.province}`
                                        : filters.province;
                                })()
                            ) : 'Toàn quốc'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-1">
                    <div className="text-left">
                        <div className="text-[9px] font-black text-premium-300 uppercase tracking-widest leading-none mb-0.5">Tìm kiếm</div>
                        <div className="text-xs font-bold text-premium-500 truncate max-w-[150px]">
                            {filters.query || 'Loại hình, tiện ích…'}
                        </div>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center bg-premium-900 text-white rounded-full group-hover:bg-black transition-all shadow-sm group-hover:shadow-md active:scale-90 ml-1">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                </div>
            </button>
        </div>
    );
}
