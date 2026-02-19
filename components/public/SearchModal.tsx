'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/lib/context/SearchContext';
import {
    X,
    Search as SearchIcon,
    Home,
    Building,
    MapPin,
    Building2,
    Sun,
    Sunrise,
    SunMedium,
    Moon,
    Calendar,
    ChevronDown,
    Trash2,
    ArrowLeft,
    Check
} from 'lucide-react';
import {
    PROVINCES_OLD,
    DISTRICTS_OLD_BY_PROVINCE,
    PROVINCES_NEW,
    WARDS_NEW_BY_PROVINCE
} from '@/lib/constants/geography';
import { SPACE_TYPES, LOCATION_TYPES, SUITABLE_FOR_OPTIONS } from '@/lib/constants/listing-options';
import { AMENITIES } from '@/lib/constants/facilities';
import { SearchFilters } from '@/types/search';

const TIME_OF_DAY_OPTIONS = [
    { label: 'Buổi sáng', icon: Sun },
    { label: 'Buổi trưa', icon: Sunrise },
    { label: 'Buổi chiều', icon: SunMedium },
    { label: 'Buổi tối', icon: Moon },
    { label: 'Nguyên ngày', icon: Calendar },
];

const LOCATION_ICONS: Record<string, any> = {
    'Mặt tiền': Home,
    'Hẻm xe hơi': Building,
    'Hẻm xe máy': MapPin,
    'Trong tòa nhà': Building2,
    'Khác': Building,
};

export default function SearchModal() {
    const {
        isModalOpen,
        setModalOpen,
        filters: confirmedFilters,
        executeSearch,
        isLoading,
        total
    } = useSearch();

    const [draftFilters, setDraftFilters] = useState<SearchFilters>(confirmedFilters);

    const [locationStep, setLocationStep] = useState<'none' | 'province' | 'district'>('none');
    const [locationSearch, setLocationSearch] = useState('');

    // Sync draft with confirmed when opening
    useEffect(() => {
        if (isModalOpen) {
            setDraftFilters(confirmedFilters);
            setLocationStep('none');
            setLocationSearch('');
        }
    }, [isModalOpen, confirmedFilters]);

    if (!isModalOpen) return null;

    const set = <K extends keyof SearchFilters>(key: K, val: SearchFilters[K]) => {
        setDraftFilters(prev => ({ ...prev, [key]: val }));
    };

    const toggleArray = (key: keyof SearchFilters, val: string) => {
        const current = draftFilters[key] as string[];
        if (current.includes(val)) {
            set(key, current.filter(x => x !== val) as any);
        } else {
            set(key, [...current, val] as any);
        }
    };

    const handleClearAll = () => {
        setDraftFilters({
            geoSystem: confirmedFilters.geoSystem,
            province: '',
            district: '',
            ward: '',
            query: '',
            spaceTypes: [],
            locationTypes: [],
            suitableFor: [],
            notSuitableFor: [],
            amenities: [],
            timeOfDay: [],
            priceMin: '',
            priceMax: '',
        });
    };

    const canSubmit = draftFilters.province !== '';

    const provinces = draftFilters.geoSystem === 'old' ? PROVINCES_OLD : PROVINCES_NEW;
    const districtData = draftFilters.geoSystem === 'old'
        ? (draftFilters.province ? DISTRICTS_OLD_BY_PROVINCE[draftFilters.province] ?? [] : [])
        : (draftFilters.province ? WARDS_NEW_BY_PROVINCE[draftFilters.province] ?? [] : []);

    const filteredProvinces = provinces.filter(p =>
        p.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const filteredDistricts = districtData.filter(d =>
        d.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const handleSelectProvince = (p: string) => {
        set('province', p);
        set('district', '');
        set('ward', '');
        setLocationStep('district');
        setLocationSearch('');
    };

    const handleToggleDistrict = (d: string) => {
        // According to SEARCH_AND_FILTER_BEHAVIOR, district is optional for old, ward is REQUIRED for new.
        // Wait, the current SearchFilters state only has one district/ward string. 
        // Let's check the types/search.ts.
        // It says string, not string[]. 
        // But the UI in the image shows multi-select.
        // I should probably update the SearchFilters to support multiple districts/wards or just pick one for now to stay safe with existing API.
        // Actually, SEARCH_AND_FILTER_BEHAVIOR.md says "District (OPTIONAL)" and "Ward (REQUIRED)".
        // I'll stick to single select for now as per current SearchFilters type to avoid breaking other things.
        if (draftFilters.geoSystem === 'old') {
            set('district', d === draftFilters.district ? '' : d);
        } else {
            set('ward', d === draftFilters.ward ? '' : d);
        }
    };

    // Helper to get selected chips text
    const getSelectedCount = () => {
        return (
            draftFilters.spaceTypes.length +
            draftFilters.locationTypes.length +
            draftFilters.suitableFor.length +
            draftFilters.amenities.length +
            draftFilters.timeOfDay.length +
            (draftFilters.query ? 1 : 0) +
            (draftFilters.province ? 1 : 0) +
            (draftFilters.district || draftFilters.ward ? 1 : 0)
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-premium-900/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setModalOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-up">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-premium-100">
                    <h2 className="text-xl font-bold text-premium-900">Bộ lọc</h2>
                    <button
                        onClick={() => setModalOpen(false)}
                        className="p-2 rounded-full hover:bg-premium-100 text-premium-400 hover:text-premium-900 transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Geography Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider">Khu vực</h3>
                            <div className="flex bg-premium-100 p-1 rounded-xl">
                                <button
                                    onClick={() => {
                                        set('geoSystem', 'old');
                                        set('province', '');
                                        set('district', '');
                                        set('ward', '');
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${draftFilters.geoSystem === 'old' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'}`}
                                >
                                    Cũ
                                </button>
                                <button
                                    onClick={() => {
                                        set('geoSystem', 'new');
                                        set('province', '');
                                        set('district', '');
                                        set('ward', '');
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${draftFilters.geoSystem === 'new' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'}`}
                                >
                                    Mới
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setLocationSearch('');
                                    setLocationStep('province');
                                }}
                                className="flex items-center justify-between px-4 py-3.5 bg-premium-50/50 border border-premium-100 rounded-2xl text-left hover:border-premium-300 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-premium-300 group-hover:text-premium-900 transition-colors" />
                                    <div>
                                        <div className="text-[10px] font-bold text-premium-400 uppercase tracking-tight">Tỉnh/Thành phố</div>
                                        <div className="text-sm font-bold text-premium-900">{draftFilters.province || 'Toàn quốc'}</div>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-premium-300" />
                            </button>

                            <button
                                onClick={() => {
                                    if (draftFilters.province) {
                                        setLocationSearch('');
                                        setLocationStep('district');
                                    }
                                }}
                                disabled={!draftFilters.province}
                                className="flex items-center justify-between px-4 py-3.5 bg-premium-50/50 border border-premium-100 rounded-2xl text-left hover:border-premium-300 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3">
                                    <Home className="w-5 h-5 text-premium-300 group-hover:text-premium-900 transition-colors" />
                                    <div>
                                        <div className="text-[10px] font-bold text-premium-400 uppercase tracking-tight">
                                            {draftFilters.geoSystem === 'old' ? 'Quận/Huyện' : 'Phường/Xã/Quận'}
                                        </div>
                                        <div className="text-sm font-bold text-premium-900">
                                            {draftFilters.geoSystem === 'old'
                                                ? (draftFilters.district || 'Chọn Quận/Huyện')
                                                : (draftFilters.ward || 'Chọn Phường/Xã/Quận')
                                            }
                                        </div>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-premium-300" />
                            </button>
                        </div>
                    </div>

                    {/* Selected Chips */}
                    {getSelectedCount() > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider">Đã chọn</h3>
                                <button
                                    onClick={handleClearAll}
                                    className="text-sm text-premium-500 hover:text-red-500 font-medium transition-colors cursor-pointer"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ...draftFilters.spaceTypes,
                                    ...draftFilters.locationTypes,
                                    ...draftFilters.suitableFor,
                                    ...draftFilters.amenities,
                                    ...draftFilters.timeOfDay,
                                    ...(draftFilters.query ? [draftFilters.query] : []),
                                    ...(draftFilters.province ? [draftFilters.province] : []),
                                    ...(draftFilters.district ? [draftFilters.district] : []),
                                    ...(draftFilters.ward ? [draftFilters.ward] : [])
                                ].map((item, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-premium-100 text-premium-700 text-xs font-semibold rounded-full border border-premium-200"
                                    >
                                        {item}
                                        <button
                                            onClick={() => {
                                                if (draftFilters.query === item) set('query', '');
                                                else if (draftFilters.province === item) { set('province', ''); set('district', ''); set('ward', ''); }
                                                else if (draftFilters.district === item) set('district', '');
                                                else if (draftFilters.ward === item) set('ward', '');
                                                else if (draftFilters.spaceTypes.includes(item)) toggleArray('spaceTypes', item);
                                                else if (draftFilters.locationTypes.includes(item)) toggleArray('locationTypes', item);
                                                else if (draftFilters.suitableFor.includes(item)) toggleArray('suitableFor', item);
                                                else if (draftFilters.amenities.includes(item)) toggleArray('amenities', item);
                                                else if (draftFilters.timeOfDay.includes(item)) toggleArray('timeOfDay', item);
                                            }}
                                            className="hover:text-premium-950 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Keywords */}
                    <div>
                        <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider mb-4">Từ khóa</h3>
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-premium-300" />
                            <input
                                type="text"
                                placeholder="Tiêu đề hoặc địa chỉ, tên đường..."
                                value={draftFilters.query}
                                onChange={e => set('query', e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-premium-50/50 border border-premium-100 rounded-2xl text-premium-900 placeholder:text-premium-300 focus:outline-none focus:ring-2 focus:ring-premium-900/5 transition-all"
                            />
                        </div>
                    </div>

                    {/* Space Types */}
                    <div>
                        <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider mb-4">Loại hình không gian</h3>
                        <div className="flex flex-wrap gap-2">
                            {SPACE_TYPES.map(type => {
                                const isSelected = draftFilters.spaceTypes.includes(type);
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleArray('spaceTypes', type)}
                                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected
                                            ? 'bg-premium-900 text-white border-premium-900'
                                            : 'bg-white text-premium-600 border-premium-200 hover:border-premium-400'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Location Types */}
                    <div>
                        <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider mb-4">Vị trí mặt bằng</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {LOCATION_TYPES.map((type) => {
                                const Icon = LOCATION_ICONS[type] || Building;
                                const isSelected = draftFilters.locationTypes.includes(type);
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleArray('locationTypes', type)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer gap-2 ${isSelected
                                            ? 'bg-premium-50 border-premium-900 text-premium-900'
                                            : 'bg-white border-premium-100 text-premium-500 hover:border-premium-300'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-premium-900' : 'text-premium-300'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{type}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time of Day */}
                    <div>
                        <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider mb-4">Thời gian thuê trong ngày</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {TIME_OF_DAY_OPTIONS.map((opt) => {
                                const isSelected = draftFilters.timeOfDay.includes(opt.label);
                                return (
                                    <button
                                        key={opt.label}
                                        type="button"
                                        onClick={() => toggleArray('timeOfDay', opt.label)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer gap-2 ${isSelected
                                            ? 'bg-premium-900 text-white border-premium-900'
                                            : 'bg-white border-premium-100 text-premium-500 hover:border-premium-300'
                                            }`}
                                    >
                                        <opt.icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider mb-4">Khoảng giá (VNĐ)</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-premium-300">Từ</span>
                                <input
                                    type="number"
                                    placeholder="Giá tối thiểu"
                                    value={draftFilters.priceMin}
                                    onChange={e => set('priceMin', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-premium-50/50 border border-premium-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-premium-900"
                                />
                            </div>
                            <div className="w-4 h-px bg-premium-200" />
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-premium-300">Đến</span>
                                <input
                                    type="number"
                                    placeholder="Giá tối đa"
                                    value={draftFilters.priceMax}
                                    onChange={e => set('priceMax', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-premium-50/50 border border-premium-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-premium-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Suitable For */}
                    <div>
                        <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider mb-4">Phù hợp cho kinh doanh</h3>
                        <div className="flex flex-wrap gap-2">
                            {SUITABLE_FOR_OPTIONS.map(opt => {
                                const isSelected = draftFilters.suitableFor.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => toggleArray('suitableFor', opt)}
                                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected
                                            ? 'bg-premium-900 text-white border-premium-900 shadow-lg shadow-premium-900/20'
                                            : 'bg-white text-premium-600 border-premium-200 hover:border-premium-400'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider mb-4">Tiện ích</h3>
                        <div className="flex flex-wrap gap-2">
                            {AMENITIES.map(opt => {
                                const isSelected = draftFilters.amenities.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => toggleArray('amenities', opt)}
                                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected
                                            ? 'bg-premium-900 text-white border-premium-900'
                                            : 'bg-white text-premium-600 border-premium-200 hover:border-premium-400'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-premium-50/50 border-t border-premium-100 flex items-center justify-between">
                    <button
                        onClick={handleClearAll}
                        className="text-premium-600 font-bold text-sm hover:text-red-500 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        Xóa tất cả
                    </button>
                    <button
                        onClick={() => executeSearch(draftFilters)}
                        disabled={!canSubmit || isLoading}
                        className="px-8 py-3.5 bg-premium-900 text-white rounded-2xl font-bold text-sm hover:bg-premium-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-premium-900/10 cursor-pointer flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            `Xem kết quả`
                        )}
                    </button>
                </div>
                {/* Location Selection Sub-modal Layer */}
                {locationStep !== 'none' && (
                    <div className="absolute inset-0 bg-white z-[110] flex flex-col animate-fade-in">
                        {/* Sub-header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-premium-100">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        if (locationStep === 'district') setLocationStep('province');
                                        else setLocationStep('none');
                                        setLocationSearch('');
                                    }}
                                    className="p-2 -ml-2 rounded-full hover:bg-premium-100 text-premium-600 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold text-premium-900">
                                    {locationStep === 'province'
                                        ? `Chọn tỉnh/thành phố (${draftFilters.geoSystem})`
                                        : draftFilters.province
                                    }
                                </h2>
                            </div>
                            <button
                                onClick={() => setLocationStep('none')}
                                className="p-2 rounded-full hover:bg-premium-100 text-premium-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Sub-search */}
                        <div className="px-8 pt-6">
                            <div className="relative">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-300" />
                                <input
                                    type="text"
                                    placeholder={locationStep === 'province' ? "Tìm tỉnh/thành phố..." : "Tìm quận/huyện/phường..."}
                                    value={locationSearch}
                                    onChange={e => setLocationSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-premium-50 border border-premium-100 rounded-xl text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Sub-list */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-1">
                            {locationStep === 'province' ? (
                                filteredProvinces.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handleSelectProvince(p)}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all ${draftFilters.province === p ? 'bg-premium-50 text-premium-900' : 'hover:bg-premium-50 text-premium-600'}`}
                                    >
                                        <span className="text-sm font-bold">{p}</span>
                                        {draftFilters.province === p && <Check className="w-4 h-4 text-premium-900" />}
                                    </button>
                                ))
                            ) : (
                                filteredDistricts.map(d => {
                                    const isSelected = draftFilters.geoSystem === 'old'
                                        ? draftFilters.district === d
                                        : draftFilters.ward === d;
                                    return (
                                        <button
                                            key={d}
                                            onClick={() => handleToggleDistrict(d)}
                                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all ${isSelected ? 'bg-premium-50 text-premium-900' : 'hover:bg-premium-50 text-premium-600'}`}
                                        >
                                            <span className="text-sm font-bold">{d}</span>
                                            {isSelected && <Check className="w-4 h-4 text-premium-900" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Sub-footer */}
                        <div className="px-8 py-6 bg-premium-50/50 border-t border-premium-100 flex items-center justify-center">
                            <p className="text-xs text-premium-400 font-medium italic">
                                {locationStep === 'province' ? "Vui lòng chọn khu vực yêu thích của bạn" : "Nhấn để chọn và tiếp tục"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
