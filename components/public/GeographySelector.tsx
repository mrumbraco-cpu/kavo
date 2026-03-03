'use client';

import React from 'react';
import { SearchFilters } from '@/types/search';
import {
    PROVINCES_OLD,
    DISTRICTS_OLD_BY_PROVINCE,
    PROVINCES_NEW,
    WARDS_NEW_BY_PROVINCE
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
        .normalize('NFD') // Separate base characters from accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[đĐ]/g, 'd')
        .replace(/\s+/g, '') // Remove ALL spaces for comparison
        .trim();
}

export default function GeographySelector({
    filters,
    onUpdate,
    onToggleDistrict,
    onSwitchSystem,
    onProvinceChange
}: GeographySelectorProps) {
    const [search, setSearch] = React.useState('');
    const activeProvinces = filters.geoSystem === 'new' ? PROVINCES_NEW : PROVINCES_OLD;

    const normalizedSearch = normalizeString(search);

    const filteredProvinces = activeProvinces.filter(p =>
        normalizeString(p).includes(normalizedSearch)
    );

    const subItems = (filters.geoSystem === 'new'
        ? WARDS_NEW_BY_PROVINCE[filters.province as keyof typeof WARDS_NEW_BY_PROVINCE] || []
        : DISTRICTS_OLD_BY_PROVINCE[filters.province as keyof typeof DISTRICTS_OLD_BY_PROVINCE] || []
    );

    const filteredSubItems = subItems.filter(d =>
        normalizeString(d).includes(normalizedSearch)
    );

    // Reset search when province changes
    React.useEffect(() => {
        setSearch('');
    }, [filters.province]);

    return (
        <div className="space-y-4">
            <div className="flex bg-premium-100 p-1 rounded-xl">
                <button
                    onClick={() => onSwitchSystem('old')}
                    type="button"
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${filters.geoSystem === 'old' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400'
                        }`}
                >
                    Hệ thống cũ
                </button>
                <button
                    onClick={() => onSwitchSystem('new')}
                    type="button"
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${filters.geoSystem === 'new' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400'
                        }`}
                >
                    Hệ thống mới
                </button>
            </div>

            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-premium-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder={filters.province ? `Tìm khu vực tại ${filters.province}…` : "Tìm tỉnh / thành phố…"}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-premium-50 border border-premium-100 rounded-xl text-xs focus:ring-1 focus:ring-premium-900/10 focus:border-premium-900/20 transition-all outline-none"
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredProvinces.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onProvinceChange(p)}
                        className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${filters.province === p
                            ? 'border-premium-900 bg-premium-900 text-white font-bold'
                            : 'border-premium-100 hover:border-premium-200 text-premium-600 bg-white'
                            }`}
                    >
                        <div className="text-[10px] truncate">{p}</div>
                    </button>
                ))}
            </div>

            {filters.province && (
                <div className="mt-4 pt-4 border-t border-premium-100">
                    <h4 className="text-[10px] font-bold text-premium-400 uppercase tracking-widest mb-3 px-1 flex items-center justify-between">
                        <span>{filters.geoSystem === 'new' ? 'Phường/Xã' : 'Quận/Huyện/Khu vực'}</span>
                        <span className="text-[9px] lowercase font-medium">({filteredSubItems.length} kết quả)</span>
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredSubItems.map((d: string) => {
                            const selected = filters.geoSystem === 'new'
                                ? filters.ward.includes(d)
                                : filters.district.includes(d);
                            return (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => onToggleDistrict(d)}
                                    className={`px-3 py-1.5 rounded-full border text-[10px] font-medium transition-all cursor-pointer ${selected
                                        ? 'bg-premium-900 border-premium-900 text-white shadow-sm'
                                        : 'bg-white border-premium-100 text-premium-600 hover:border-premium-300'
                                        }`}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
