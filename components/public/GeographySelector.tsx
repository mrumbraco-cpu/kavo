'use client';

import React from 'react';
import { SearchFilters } from '@/types/search';
import {
    PROVINCES_OLD_DATA,
    PROVINCES_NEW_DATA,
    DISTRICTS_OLD_DATA_BY_PROVINCE,
    WARDS_NEW_DATA_BY_PROVINCE,
    getProvinceById,
    getDistrictById,
    getWardById
} from '@/lib/constants/geography';

interface GeographySelectorProps {
    filters: SearchFilters;
    onUpdate: (key: keyof SearchFilters, value: any) => void;
    onToggleDistrict: (district: string) => void;
    onSwitchSystem: (system: 'old' | 'new') => void;
    onProvinceChange: (province: string) => void;
}

function normalizeString(str: string) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/\s+/g, '')
        .trim();
}

// Popular locations in Vietnam
const POPULAR_IDS = ['79', '01', '48', '74', '92', '31'];

export default function GeographySelector({
    filters,
    onUpdate,
    onToggleDistrict,
    onSwitchSystem,
    onProvinceChange
}: GeographySelectorProps) {
    const [search, setSearch] = React.useState('');
    const activeProvinceData = filters.geoSystem === 'new' ? PROVINCES_NEW_DATA : PROVINCES_OLD_DATA;
    const normalizedSearch = normalizeString(search);

    const filteredProvinces = activeProvinceData.filter(p =>
        normalizeString(p.label).includes(normalizedSearch) ||
        normalizeString(p.fullName).includes(normalizedSearch)
    );

    const popularProvinces = activeProvinceData.filter(p => POPULAR_IDS.includes(p.id));

    const subItems = (filters.geoSystem === 'new'
        ? WARDS_NEW_DATA_BY_PROVINCE[filters.province as keyof typeof WARDS_NEW_DATA_BY_PROVINCE] || []
        : DISTRICTS_OLD_DATA_BY_PROVINCE[filters.province as keyof typeof DISTRICTS_OLD_DATA_BY_PROVINCE] || []
    );

    const filteredSubItems = subItems.filter(d =>
        normalizeString(d.label).includes(normalizedSearch)
    );

    // Reset search when province changes
    React.useEffect(() => {
        setSearch('');
    }, [filters.province]);

    const activeProvinceLabel = getProvinceById(filters.province, filters.geoSystem)?.label || '';

    return (
        <div className="space-y-4">
            {/* System Switcher */}
            <div className="flex bg-premium-100 p-1 rounded-xl">
                <button
                    onClick={() => onSwitchSystem('old')}
                    type="button"
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${filters.geoSystem === 'old' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400'
                        }`}
                >
                    Trước sáp nhập
                </button>
                <button
                    onClick={() => onSwitchSystem('new')}
                    type="button"
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${filters.geoSystem === 'new' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400'
                        }`}
                >
                    Sau sáp nhập
                </button>
            </div>

            {/* Search Bar - Fixed at top */}
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder={filters.province ? `Lọc khu vực tại ${activeProvinceLabel}…` : "Tìm tỉnh / thành phố…"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-premium-50 border border-premium-100 rounded-xl text-xs focus:ring-1 focus:ring-premium-900/10 focus:border-premium-900/20 transition-all outline-none"
                />
            </div>

            {/* Conditional Content: Province Selection OR District Selection */}
            {!filters.province ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Popular - Only show if not searching */}
                    {!search && popularProvinces.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold text-premium-400 uppercase tracking-widest mb-2 px-1">Phổ biến</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {popularProvinces.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => onProvinceChange(p.id)}
                                        className="px-3 py-2 rounded-xl border border-premium-100 bg-white hover:border-premium-200 hover:bg-premium-50 transition-all cursor-pointer group"
                                    >
                                        <div className="text-[10px] font-bold text-premium-900 truncate group-hover:scale-105 transition-transform">{p.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Provinces */}
                    <div>
                        <h4 className="text-[10px] font-bold text-premium-400 uppercase tracking-widest mb-2 px-1">
                            {search ? 'Kết quả tìm kiếm' : 'Tất cả tỉnh thành'}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                            {filteredProvinces.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => onProvinceChange(p.id)}
                                    className="px-3 py-2 rounded-xl border border-premium-100 bg-white hover:border-premium-200 hover:bg-premium-50 transition-all cursor-pointer text-left"
                                >
                                    <div className="text-[10px] text-premium-600 truncate">{p.label}</div>
                                </button>
                            ))}
                            {filteredProvinces.length === 0 && (
                                <div className="col-span-full py-8 text-center text-premium-400 text-[11px] font-medium">
                                    Không tìm thấy tỉnh thành nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Selected Province Header */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-premium-900">{activeProvinceLabel}</span>
                            <button
                                onClick={() => onUpdate('province', '')}
                                className="text-[10px] font-bold text-premium-400 hover:text-premium-900 transition-colors underline underline-offset-2 decoration-premium-200 cursor-pointer"
                            >
                                Thay đổi
                            </button>
                        </div>
                        <span className="text-[9px] font-bold text-premium-400 uppercase tracking-widest leading-none">
                            {filters.geoSystem === 'new' ? 'Phường/Xã' : 'Quận/Huyện'}
                        </span>
                    </div>

                    {/* Sub-items (Districts/Wards) */}
                    <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredSubItems.map((d) => {
                            const isSelected = filters.geoSystem === 'new'
                                ? filters.ward.includes(d.id)
                                : filters.district.includes(d.id);
                            return (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => onToggleDistrict(d.id)}
                                    className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${isSelected
                                        ? 'bg-premium-900 border-premium-900 text-white shadow-md shadow-premium-900/10'
                                        : 'bg-white border-premium-100 text-premium-600 hover:border-premium-300'
                                        }`}
                                >
                                    {filters.geoSystem === 'new' ? d.label : d.fullName}
                                </button>
                            );
                        })}
                        {filteredSubItems.length === 0 && (
                            <div className="w-full py-8 text-center text-premium-400 text-[11px] font-medium">
                                {search ? 'Không tìm thấy khu vực nào' : 'Chọn tỉnh thành để xem khu vực'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
