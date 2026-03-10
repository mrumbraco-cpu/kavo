'use client';

import { useSearch } from '@/lib/context/SearchContext';
import { usePathname } from 'next/navigation';
import { getProvinceById, getDistrictById, getWardById } from '@/lib/constants/geography';
// No icons needed from lucide-react here anymore

export default function HeaderSearch() {
    const { filters, setModalOpen } = useSearch();
    const pathname = usePathname();

    const isSearchPage = pathname === '/search';
    const isListingDetail = pathname.startsWith('/listings/');

    if (!isSearchPage && !isListingDetail) return null;

    return (
        <div className="flex items-center">
            {/* Desktop Search Button (hidden on mobile) */}
            <button
                onClick={() => setModalOpen(true)}
                className="hidden lg:flex items-center pl-1.5 pr-2 py-1.5 bg-white border border-premium-100 rounded-full shadow-sm hover:shadow-md hover:border-premium-200 transition-all cursor-pointer group"
            >
                <div className="flex items-center gap-2.5 pr-4 border-r border-premium-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white group-hover:bg-premium-50 transition-colors shadow-sm border border-premium-50">
                        <svg className="w-3.5 h-3.5 text-premium-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="text-left">
                        <div className="text-[9px] font-black text-premium-300 uppercase tracking-widest leading-none mb-0.5">Khu vực</div>
                        <div className="text-xs font-bold text-premium-900 truncate max-w-[130px]">
                            {filters.province ? (
                                (() => {
                                    const provinceLabel = getProvinceById(filters.province, filters.geoSystem)?.label || filters.province;
                                    if (filters.geoSystem === 'new') {
                                        return filters.ward.length > 0
                                            ? `${filters.ward.map(id => getWardById(filters.province, id)?.label || id).join(', ')}, ${provinceLabel}`
                                            : provinceLabel;
                                    } else {
                                        return filters.district.length > 0
                                            ? `${filters.district.map(id => getDistrictById(filters.province, id)?.fullName || id).join(', ')}, ${provinceLabel}`
                                            : provinceLabel;
                                    }
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
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </div>
                </div>
            </button>
        </div>
    );
}

