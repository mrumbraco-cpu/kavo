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

const normalizeString = (str: string) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');
};

const formatCurrencyInput = (val: string) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(digits));
};

const PRICE_PRESETS = [
    { label: 'Dưới 50K', min: '0', max: '50000' },
    { label: '50K - 100K', min: '50000', max: '100000' },
    { label: '100K - 200K', min: '100000', max: '200000' },
    { label: '200K - 500K', min: '200000', max: '500000' },
    { label: '500K - 1M', min: '500000', max: '1000000' },
    { label: '1M - 2M', min: '1000000', max: '2000000' },
    { label: '2M - 5M', min: '2000000', max: '5000000' },
    { label: 'Trên 5M', min: '5000000', max: '' },
];

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
            district: [],
            ward: [],
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

    const canSubmit = draftFilters.province !== '' && (draftFilters.geoSystem === 'old' || draftFilters.ward.length > 0);

    const provinces = draftFilters.geoSystem === 'old' ? PROVINCES_OLD : PROVINCES_NEW;
    const districtData = draftFilters.geoSystem === 'old'
        ? (draftFilters.province ? DISTRICTS_OLD_BY_PROVINCE[draftFilters.province] ?? [] : [])
        : (draftFilters.province ? WARDS_NEW_BY_PROVINCE[draftFilters.province] ?? [] : []);

    const filteredProvinces = provinces.filter(p =>
        normalizeString(p).includes(normalizeString(locationSearch))
    );

    const filteredDistricts = districtData.filter(d =>
        normalizeString(d).includes(normalizeString(locationSearch))
    );

    const handleSelectProvince = (p: string) => {
        set('province', p);
        set('district', []);
        set('ward', []);
        setLocationStep('district');
        setLocationSearch('');
    };

    const handleToggleDistrict = (d: string) => {
        const key = draftFilters.geoSystem === 'old' ? 'district' : 'ward';
        const current = draftFilters[key] as string[];
        if (current.includes(d)) {
            set(key, current.filter(x => x !== d) as any);
        } else {
            if (current.length >= 5) return;
            set(key, [...current, d] as any);
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
            (draftFilters.query ? 1 : 0)
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
                                        set('district', []);
                                        set('ward', []);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${draftFilters.geoSystem === 'old' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-600'}`}
                                >
                                    Cũ
                                </button>
                                <button
                                    onClick={() => {
                                        set('geoSystem', 'new');
                                        set('province', '');
                                        set('district', []);
                                        set('ward', []);
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
                                        <div className="text-sm font-bold text-premium-900 truncate max-w-[180px]">
                                            {draftFilters.geoSystem === 'old'
                                                ? (draftFilters.district.length > 0 ? draftFilters.district.join(', ') : 'Chọn Quận/Huyện')
                                                : (draftFilters.ward.length > 0 ? draftFilters.ward.join(', ') : 'Chọn Phường/Xã/Quận')
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
                                    ...(draftFilters.query ? [draftFilters.query] : [])
                                ].map((item, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-premium-100 text-premium-700 text-xs font-semibold rounded-full border border-premium-200"
                                    >
                                        {item}
                                        <button
                                            onClick={() => {
                                                if (draftFilters.query === item) set('query', '');
                                                else if (draftFilters.province === item) { set('province', ''); set('district', []); set('ward', []); }
                                                else if (draftFilters.district.includes(item)) handleToggleDistrict(item);
                                                else if (draftFilters.ward.includes(item)) handleToggleDistrict(item);
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-premium-900 uppercase tracking-wider">Khoảng giá</h3>
                            <ChevronDown className="w-4 h-4 text-premium-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-premium-400 uppercase ml-1">Từ</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="0"
                                        value={formatCurrencyInput(draftFilters.priceMin)}
                                        onChange={e => set('priceMin', e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-premium-100 rounded-xl text-sm font-bold text-premium-900 focus:outline-none focus:ring-2 focus:ring-premium-900/5 focus:border-premium-900 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-premium-300">đ</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-premium-400 uppercase ml-1">Đến</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Không giới hạn"
                                        value={formatCurrencyInput(draftFilters.priceMax)}
                                        onChange={e => set('priceMax', e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-premium-100 rounded-xl text-sm font-bold text-premium-900 focus:outline-none focus:ring-2 focus:ring-premium-900/5 focus:border-premium-900 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-premium-300">đ</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold text-premium-400 uppercase tracking-wider mb-3 ml-1">Khoảng giá phổ biến</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {PRICE_PRESETS.map((preset) => {
                                    const isSelected = draftFilters.priceMin === preset.min && draftFilters.priceMax === preset.max;
                                    return (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => {
                                                set('priceMin', preset.min);
                                                set('priceMax', preset.max);
                                            }}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${isSelected
                                                    ? 'bg-premium-900 text-white border-premium-900'
                                                    : 'bg-premium-50/50 text-premium-600 border-transparent hover:bg-premium-100 hover:text-premium-900'
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
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
                                        ? draftFilters.district.includes(d)
                                        : draftFilters.ward.includes(d);
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
                        <div className="px-8 py-6 bg-premium-50/50 border-t border-premium-100 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                {locationStep === 'district' && (
                                    <p className="text-xs text-premium-500 font-medium">
                                        Đã chọn {draftFilters.geoSystem === 'old' ? draftFilters.district.length : draftFilters.ward.length}/5
                                        {draftFilters.geoSystem === 'new' && (
                                            <span className="text-red-500 ml-1 ml-1">* Bắt buộc</span>
                                        )}
                                    </p>
                                )}
                                {locationStep === 'province' && (
                                    <p className="text-xs text-premium-400 font-medium italic">Vui lòng chọn khu vực yêu thích của bạn</p>
                                )}
                            </div>

                            {locationStep === 'district' && (
                                <button
                                    onClick={() => setLocationStep('none')}
                                    disabled={draftFilters.geoSystem === 'new' && draftFilters.ward.length === 0}
                                    className="px-8 py-2.5 bg-premium-900 text-white rounded-xl font-bold text-sm hover:bg-premium-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    Xác nhận
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
