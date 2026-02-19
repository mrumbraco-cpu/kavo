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
        <div>
            <p className="text-xs font-semibold text-premium-700 uppercase tracking-wider mb-2">{label}</p>
            <div className="flex flex-wrap gap-1.5">
                {options.map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${selected.includes(opt)
                            ? 'bg-premium-900 text-white border-premium-900'
                            : 'bg-white text-premium-600 border-premium-200 hover:border-premium-400'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Geography System Toggle */}
            <div>
                <p className="text-xs font-semibold text-premium-700 uppercase tracking-wider mb-2">Hệ thống địa chính</p>
                <div className="flex rounded-lg border border-premium-200 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => { set('geoSystem', 'old'); set('province', ''); set('district', ''); set('ward', ''); }}
                        className={`flex-1 py-2 text-xs font-medium transition-colors cursor-pointer ${filters.geoSystem === 'old' ? 'bg-premium-900 text-white' : 'text-premium-600 hover:bg-premium-50'}`}
                    >
                        Hành chính cũ
                    </button>
                    <button
                        type="button"
                        onClick={() => { set('geoSystem', 'new'); set('province', ''); set('district', ''); set('ward', ''); }}
                        className={`flex-1 py-2 text-xs font-medium transition-colors cursor-pointer ${filters.geoSystem === 'new' ? 'bg-premium-900 text-white' : 'text-premium-600 hover:bg-premium-50'}`}
                    >
                        Hành chính mới
                    </button>
                </div>
            </div>

            {/* Province (required) */}
            <div>
                <label className="text-xs font-semibold text-premium-700 uppercase tracking-wider mb-2 block">
                    <span className="text-red-500">*</span> Tỉnh/Thành phố
                </label>
                <select
                    value={filters.province}
                    onChange={e => { set('province', e.target.value); set('district', ''); set('ward', ''); }}
                    className="w-full px-3 py-2 rounded-lg border border-premium-200 text-sm text-premium-900 bg-white focus:outline-none focus:ring-1 focus:ring-premium-400"
                >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* District (old system, optional) */}
            {filters.geoSystem === 'old' && filters.province && (
                <div>
                    <label className="text-xs font-semibold text-premium-700 uppercase tracking-wider mb-2 block">Quận/Huyện (tùy chọn)</label>
                    <select
                        value={filters.district}
                        onChange={e => set('district', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-premium-200 text-sm text-premium-900 bg-white focus:outline-none focus:ring-1 focus:ring-premium-400"
                    >
                        <option value="">-- Tất cả quận/huyện --</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            )}

            {/* Ward (new system, required) */}
            {filters.geoSystem === 'new' && filters.province && (
                <div>
                    <label className="text-xs font-semibold text-premium-700 uppercase tracking-wider mb-2 block">
                        <span className="text-red-500">*</span> Phường/Xã
                    </label>
                    <select
                        value={filters.ward}
                        onChange={e => set('ward', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-premium-200 text-sm text-premium-900 bg-white focus:outline-none focus:ring-1 focus:ring-premium-400"
                    >
                        <option value="">-- Chọn phường/xã --</option>
                        {wards.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
            )}

            {/* Separator */}
            <hr className="border-premium-100" />

            {/* Text search */}
            <div>
                <label className="text-xs font-semibold text-premium-700 uppercase tracking-wider mb-2 block">Từ khóa tìm kiếm</label>
                <input
                    type="text"
                    value={filters.query}
                    onChange={e => set('query', e.target.value)}
                    placeholder="Tên không gian, mô tả, địa chỉ..."
                    className="w-full px-3 py-2 rounded-lg border border-premium-200 text-sm text-premium-900 placeholder:text-premium-300 bg-white focus:outline-none focus:ring-1 focus:ring-premium-400"
                />
            </div>

            {/* Price range */}
            <div>
                <p className="text-xs font-semibold text-premium-700 uppercase tracking-wider mb-2">Mức giá (₫)</p>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        value={filters.priceMin}
                        onChange={e => set('priceMin', e.target.value)}
                        placeholder="Từ"
                        className="flex-1 px-3 py-2 rounded-lg border border-premium-200 text-sm text-premium-900 bg-white focus:outline-none focus:ring-1 focus:ring-premium-400"
                    />
                    <span className="text-premium-300 text-sm">–</span>
                    <input
                        type="number"
                        value={filters.priceMax}
                        onChange={e => set('priceMax', e.target.value)}
                        placeholder="Đến"
                        className="flex-1 px-3 py-2 rounded-lg border border-premium-200 text-sm text-premium-900 bg-white focus:outline-none focus:ring-1 focus:ring-premium-400"
                    />
                </div>
            </div>

            {/* Space types */}
            <CheckboxGroup label="Loại không gian" options={SPACE_TYPES} selected={filters.spaceTypes} onChange={v => set('spaceTypes', v)} />

            {/* Location types */}
            <CheckboxGroup label="Vị trí" options={LOCATION_TYPES} selected={filters.locationTypes} onChange={v => set('locationTypes', v)} />

            {/* Suitable for */}
            <CheckboxGroup label="Phù hợp cho" options={SUITABLE_FOR_OPTIONS} selected={filters.suitableFor} onChange={v => set('suitableFor', v)} />

            {/* Not suitable for */}
            <CheckboxGroup label="Không phù hợp cho (loại trừ)" options={NOT_SUITABLE_FOR_OPTIONS} selected={filters.notSuitableFor} onChange={v => set('notSuitableFor', v)} />

            {/* Amenities */}
            <CheckboxGroup label="Tiện ích" options={AMENITIES} selected={filters.amenities} onChange={v => set('amenities', v)} />

            {/* Submit */}
            <button
                type="submit"
                disabled={!canSearch || isLoading}
                className="w-full py-3 bg-premium-900 text-white rounded-xl font-semibold text-sm hover:bg-premium-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang tìm...
                    </span>
                ) : (
                    '🔍 Tìm kiếm'
                )}
            </button>

            {!canSearch && (
                <p className="text-xs text-red-400 text-center">Vui lòng chọn tỉnh/thành phố trước khi tìm kiếm</p>
            )}
        </form>
    );
}
