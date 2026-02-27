'use client';

import { useState } from 'react';
import {
    PROVINCES_OLD,
    DISTRICTS_OLD_BY_PROVINCE,
    PROVINCES_NEW,
    WARDS_NEW_BY_PROVINCE
} from '@/lib/constants/geography';
import { SPACE_TYPES, LOCATION_TYPES, SUITABLE_FOR_OPTIONS, NOT_SUITABLE_FOR_OPTIONS } from '@/lib/constants/listing-options';
import { AMENITIES } from '@/lib/constants/facilities';

export interface SearchFilters {
    // Geography
    geoSystem: 'old' | 'new';
    province: string;
    district: string;
    ward: string;
    // Text
    query: string;
    // Filters
    spaceTypes: string[];
    locationTypes: string[];
    suitableFor: string[];
    notSuitableFor: string[];
    amenities: string[];
    priceMin: string;
    priceMax: string;
}

interface Props {
    onSearch: (filters: SearchFilters) => void;
    isLoading: boolean;
}

const DEFAULT_FILTERS: SearchFilters = {
    geoSystem: 'old',
    province: '',
    district: '',
    ward: '',
    query: '',
    spaceTypes: [],
    locationTypes: [],
    suitableFor: [],
    notSuitableFor: [],
    amenities: [],
    priceMin: '',
    priceMax: '',
};

function CheckboxGroup({
    label,
    options,
    selected,
    onChange,
}: {
    label: string;
    options: readonly string[];
    selected: string[];
    onChange: (val: string[]) => void;
}) {
    const toggle = (opt: string) => {
        onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
    };
    return (
        <div className="space-y-3">
            <p className="text-[11px] font-bold text-premium-400 uppercase tracking-[0.2em]">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                    const isSelected = selected.includes(opt);
                    const id = `cb-${label.replace(/\s+/g, '-')}-${opt.replace(/\s+/g, '-')}`;
                    return (
                        <div key={opt} className="relative">
                            <input
                                id={id}
                                type="checkbox"
                                className="sr-only"
                                checked={isSelected}
                                onChange={() => toggle(opt)}
                            />
                            <label
                                htmlFor={id}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-300 cursor-pointer block ${isSelected
                                    ? 'bg-premium-900 text-white border-premium-900 shadow-md shadow-premium-900/10'
                                    : 'bg-white text-premium-500 border-premium-100 hover:border-premium-300 hover:bg-premium-50/50'
                                    }`}
                            >
                                {opt}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function SearchFilterPanel({ onSearch, isLoading }: Props) {
    const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

    const set = <K extends keyof SearchFilters>(key: K, val: SearchFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: val }));
    };

    const canSearch = filters.province !== '';

    const districts = filters.geoSystem === 'old' && filters.province
        ? DISTRICTS_OLD_BY_PROVINCE[filters.province] ?? []
        : [];
    const wards = filters.geoSystem === 'new' && filters.province
        ? WARDS_NEW_BY_PROVINCE[filters.province] ?? []
        : [];
    const provinces = filters.geoSystem === 'old' ? PROVINCES_OLD : PROVINCES_NEW;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSearch) return;
        onSearch(filters);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Geography System Toggle */}
            <div className="space-y-3">
                <p className="text-[11px] font-bold text-premium-400 uppercase tracking-[0.2em]">Hệ thống địa chính</p>
                <div className="flex p-1 bg-premium-50 rounded-xl border border-premium-100/50">
                    <button
                        type="button"
                        onClick={() => { set('geoSystem', 'old'); set('province', ''); set('district', ''); set('ward', ''); }}
                        className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 rounded-lg cursor-pointer ${filters.geoSystem === 'new' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'}`}
                    >
                        Hành chính mới
                    </button>
                </div>
            </div>

            {/* Province (required) */}
            <div className="space-y-3">
                <label className="text-[11px] font-bold text-premium-400 uppercase tracking-[0.2em] block">
                    <span className="text-accent-gold">*</span> Tỉnh/Thành phố
                </label>
                <select
                    value={filters.province}
                    onChange={e => { set('province', e.target.value); set('district', ''); set('ward', ''); }}
                    autoComplete="address-level1"
                    className="w-full px-4 py-2.5 rounded-xl border border-premium-100 text-sm font-bold text-premium-900 bg-white focus:outline-none focus:ring-2 focus:ring-premium-900/10 focus:border-premium-900 transition-all cursor-pointer"
                >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* District (old system, optional) */}
            {filters.geoSystem === 'old' && filters.province && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-bold text-premium-400 uppercase tracking-[0.2em] block">Quận/Huyện (tùy chọn)</label>
                    <select
                        value={filters.district}
                        onChange={e => set('district', e.target.value)}
                        autoComplete="address-level2"
                        className="w-full px-4 py-2.5 rounded-xl border border-premium-100 text-sm font-bold text-premium-900 bg-white focus:outline-none focus:ring-2 focus:ring-premium-900/10 focus:border-premium-900 transition-all cursor-pointer"
                    >
                        <option value="">-- Tất cả quận/huyện --</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            )}

            {/* Ward (new system, required) */}
            {filters.geoSystem === 'new' && filters.province && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-bold text-premium-400 uppercase tracking-[0.2em] block">
                        <span className="text-accent-gold">*</span> Phường/Xã
                    </label>
                    <select
                        value={filters.ward}
                        onChange={e => set('ward', e.target.value)}
                        autoComplete="address-level3"
                        className="w-full px-4 py-2.5 rounded-xl border border-premium-100 text-sm font-bold text-premium-900 bg-white focus:outline-none focus:ring-2 focus:ring-premium-900/10 focus:border-premium-900 transition-all cursor-pointer"
                    >
                        <option value="">-- Chọn phường/xã --</option>
                        {wards.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
            )}

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-premium-100 to-transparent" />

            {/* Text search */}
            <div className="space-y-3">
                <label className="text-[11px] font-bold text-premium-400 uppercase tracking-[0.2em] block">Từ khóa tìm kiếm</label>
                <div className="relative group">
                    <input
                        type="text"
                        value={filters.query}
                        onChange={e => set('query', e.target.value)}
                        placeholder="Tên không gian, mô tả, địa chỉ…"
                        autoComplete="off"
                        className="w-full px-4 py-2.5 rounded-xl border border-premium-100 text-sm font-bold text-premium-900 placeholder:text-premium-200 bg-white focus:outline-none focus:ring-2 focus:ring-premium-900/10 focus:border-premium-900 transition-all"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-premium-200 group-focus-within:text-premium-900 transition-colors">
                        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Price range */}
            <div className="space-y-3">
                <p className="text-[11px] font-bold text-premium-400 uppercase tracking-[0.2em]">Mức giá ($)</p>
                <div className="flex gap-3 items-center">
                    <div className="relative flex-1">
                        <input
                            type="number"
                            value={filters.priceMin}
                            onChange={e => set('priceMin', e.target.value)}
                            placeholder="Từ"
                            className="w-full px-4 py-2.5 rounded-xl border border-premium-100 text-sm font-bold text-premium-900 bg-white focus:outline-none focus:ring-2 focus:ring-premium-900/5 focus:border-premium-900 transition-all"
                        />
                    </div>
                    <span className="text-premium-200 text-sm font-bold">–</span>
                    <div className="relative flex-1">
                        <input
                            type="number"
                            value={filters.priceMax}
                            onChange={e => set('priceMax', e.target.value)}
                            placeholder="Đến"
                            className="w-full px-4 py-2.5 rounded-xl border border-premium-100 text-sm font-bold text-premium-900 bg-white focus:outline-none focus:ring-2 focus:ring-premium-900/5 focus:border-premium-900 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Space types */}
            <CheckboxGroup label="Loại không gian" options={SPACE_TYPES} selected={filters.spaceTypes} onChange={v => set('spaceTypes', v)} />

            {/* Location types */}
            <CheckboxGroup label="Vị trí" options={LOCATION_TYPES} selected={filters.locationTypes} onChange={v => set('locationTypes', v)} />

            {/* Suitable for */}
            <CheckboxGroup label="Phù hợp cho" options={SUITABLE_FOR_OPTIONS} selected={filters.suitableFor} onChange={v => set('suitableFor', v)} />

            {/* Not suitable for */}
            <CheckboxGroup label="Địa điểm loại trừ" options={NOT_SUITABLE_FOR_OPTIONS} selected={filters.notSuitableFor} onChange={v => set('notSuitableFor', v)} />

            {/* Amenities */}
            <CheckboxGroup label="Tiện ích" options={AMENITIES} selected={filters.amenities} onChange={v => set('amenities', v)} />

            {/* Submit */}
            <div className="pt-4 sticky bottom-0 bg-white/10 backdrop-blur-sm -mx-2 px-2 pb-2">
                <button
                    type="submit"
                    disabled={!canSearch || isLoading}
                    className="w-full py-4 bg-premium-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-premium-800 transition-all hover:shadow-xl hover:shadow-premium-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 overflow-hidden group"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 animate-spin" aria-hidden="true" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Đang tìm…
                        </span>
                    ) : (
                        <>
                            <span>Tìm kiếm không gian</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </>
                    )}
                </button>

                {!canSearch && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-accent-gold animate-pulse">
                        <svg className="w-3 h-3" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Chọn tỉnh/thành phố
                    </div>
                )}
            </div>
        </form>
    );
}
