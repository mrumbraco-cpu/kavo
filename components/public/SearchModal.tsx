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
import { AMENITIES, NEARBY_FEATURES } from '@/lib/constants/facilities';
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
        .replace(/đ/g, 'd')
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
    { label: '50K – 100K', min: '50000', max: '100000' },
    { label: '100K – 200K', min: '100000', max: '200000' },
    { label: '200K – 500K', min: '200000', max: '500000' },
    { label: '500K – 1M', min: '500000', max: '1000000' },
    { label: '1M – 2M', min: '1000000', max: '2000000' },
    { label: '2M – 5M', min: '2000000', max: '5000000' },
    { label: 'Trên 5M', min: '5000000', max: '' },
];

// ─── Reusable chip button ────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer whitespace-nowrap ${selected
                ? 'bg-premium-900 text-white border-premium-900'
                : 'bg-white text-premium-700 border-premium-200 hover:border-premium-400'
                }`}
        >
            {label}
        </button>
    );
}

// ─── Section wrapper with divider ────────────────────────────────────────────
function Section({ title, children, collapsible = false, defaultExpanded = true }: { title: string; children: React.ReactNode; collapsible?: boolean; defaultExpanded?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    return (
        <div className="py-5 border-b border-premium-100 last:border-b-0">
            {collapsible ? (
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center justify-between text-left cursor-pointer group"
                >
                    <h3 className="text-sm font-semibold text-premium-900 group-hover:text-premium-700 transition-colors">{title}</h3>
                    <ChevronDown className={`w-4 h-4 text-premium-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            ) : (
                <h3 className="text-sm font-semibold text-premium-900 mb-3">{title}</h3>
            )}

            {(!collapsible || isExpanded) && (
                <div className={collapsible ? "mt-4 animate-fade-in" : ""}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function SearchModal() {
    const {
        isModalOpen,
        setModalOpen,
        filters: confirmedFilters,
        executeSearch,
        isLoading,
    } = useSearch();

    const [draftFilters, setDraftFilters] = useState<SearchFilters>(confirmedFilters);
    const [locationStep, setLocationStep] = useState<'none' | 'province' | 'district'>('none');
    const [locationSearch, setLocationSearch] = useState('');

    useEffect(() => {
        if (isModalOpen) {
            setDraftFilters(confirmedFilters);
            setLocationSearch('');
            if (!confirmedFilters.province) {
                setLocationStep('province');
            } else {
                setLocationStep('none');
            }
        }
    }, [isModalOpen, confirmedFilters]);

    if (!isModalOpen) return null;

    const set = <K extends keyof SearchFilters>(key: K, val: SearchFilters[K]) => {
        setDraftFilters(prev => ({ ...prev, [key]: val }));
    };

    const toggleArray = (key: keyof SearchFilters, val: string) => {
        const current = draftFilters[key] as string[];
        set(key, (current.includes(val) ? current.filter(x => x !== val) : [...current, val]) as any);
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
            nearbyFeatures: [],
            timeOfDay: [],
            priceMin: '',
            priceMax: '',
        });
    };

    const canSubmit = draftFilters.province !== '' &&
        (draftFilters.geoSystem === 'old' || draftFilters.ward.length > 0);

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

    const handleSwitchGeoSystem = (system: 'old' | 'new') => {
        set('geoSystem', system);
        set('province', '');
        set('district', []);
        set('ward', []);
        setLocationSearch('');
        setLocationStep('province');
    };

    const handleCloseSubLayer = () => {
        if (!draftFilters.province) { setModalOpen(false); }
        else { setLocationStep('none'); }
        setLocationSearch('');
    };

    const handleBackFromProvince = () => {
        if (!draftFilters.province) { setModalOpen(false); }
        else { setLocationStep('none'); }
        setLocationSearch('');
    };

    const handleBackFromDistrict = () => {
        setLocationStep('province');
        setLocationSearch('');
    };

    const selectedDistrictText = draftFilters.geoSystem === 'old'
        ? (draftFilters.district.length > 0 ? draftFilters.district.join(', ') : 'Tất cả')
        : (draftFilters.ward.length > 0 ? draftFilters.ward.join(', ') : 'Chọn phường/xã');

    const districtLabel = draftFilters.geoSystem === 'old' ? 'Quận/Huyện' : 'Phường/Xã';

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
                onClick={() => setModalOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-fade-up rounded-t-2xl">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-premium-100 flex-shrink-0">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="p-1.5 rounded-full hover:bg-premium-100 text-premium-400 hover:text-premium-900 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-sm font-semibold text-premium-900 absolute left-1/2 -translate-x-1/2">Bộ lọc</h2>
                    <button
                        onClick={handleClearAll}
                        className="text-xs font-semibold text-premium-600 hover:text-premium-900 underline cursor-pointer transition-colors"
                    >
                        Xóa tất cả
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-5">

                    {/* Khu vực */}
                    <div className="py-5 border-b border-premium-100">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-premium-900">Khu vực</h3>
                            {/* Geo toggle */}
                            <div className="flex bg-premium-100 p-0.5 rounded-lg">
                                <button
                                    onClick={() => { set('geoSystem', 'old'); set('province', ''); set('district', []); set('ward', []); }}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${draftFilters.geoSystem === 'old' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-700'}`}
                                >
                                    Cũ
                                </button>
                                <button
                                    onClick={() => { set('geoSystem', 'new'); set('province', ''); set('district', []); set('ward', []); }}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${draftFilters.geoSystem === 'new' ? 'bg-white text-premium-900 shadow-sm' : 'text-premium-400 hover:text-premium-700'}`}
                                >
                                    Mới
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {/* Province button */}
                            <button
                                onClick={() => { setLocationSearch(''); setLocationStep('province'); }}
                                className="flex items-center justify-between px-3 py-2.5 border border-premium-200 rounded-xl text-left hover:border-premium-400 transition-all cursor-pointer group"
                            >
                                <div className="min-w-0">
                                    <div className="text-[10px] font-semibold text-premium-400 uppercase tracking-wide mb-0.5">Tỉnh/Thành</div>
                                    <div className={`text-xs font-semibold truncate ${draftFilters.province ? 'text-premium-900' : 'text-red-400'}`}>
                                        {draftFilters.province || '* Bắt buộc'}
                                    </div>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-premium-300 flex-shrink-0 ml-1" />
                            </button>

                            {/* District/Ward button */}
                            <button
                                onClick={() => { if (draftFilters.province) { setLocationSearch(''); setLocationStep('district'); } }}
                                disabled={!draftFilters.province}
                                className="flex items-center justify-between px-3 py-2.5 border border-premium-200 rounded-xl text-left hover:border-premium-400 transition-all cursor-pointer group disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <div className="min-w-0">
                                    <div className="text-[10px] font-semibold text-premium-400 uppercase tracking-wide mb-0.5">
                                        {districtLabel}
                                        {draftFilters.geoSystem === 'new' && <span className="text-red-400 ml-0.5">*</span>}
                                    </div>
                                    <div className="text-xs font-semibold text-premium-900 truncate">
                                        {selectedDistrictText}
                                    </div>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-premium-300 flex-shrink-0 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Từ khóa */}
                    <Section title="Từ khóa">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-300" />
                            <input
                                type="text"
                                placeholder="Tiêu đề, địa chỉ, tên đường..."
                                value={draftFilters.query}
                                onChange={e => set('query', e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-premium-200 rounded-xl text-sm text-premium-900 placeholder:text-premium-300 focus:outline-none focus:ring-1 focus:ring-premium-400 focus:border-premium-400 transition-all"
                            />
                        </div>
                    </Section>

                    {/* Loại hình không gian */}
                    <Section title="Loại hình không gian">
                        <div className="flex flex-wrap gap-2">
                            {SPACE_TYPES.map(type => (
                                <Chip
                                    key={type}
                                    label={type}
                                    selected={draftFilters.spaceTypes.includes(type)}
                                    onClick={() => toggleArray('spaceTypes', type)}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* Vị trí mặt bằng */}
                    <Section title="Vị trí mặt bằng">
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {LOCATION_TYPES.map((type) => {
                                const Icon = LOCATION_ICONS[type] || Building;
                                const isSelected = draftFilters.locationTypes.includes(type);
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleArray('locationTypes', type)}
                                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all cursor-pointer gap-1.5 ${isSelected
                                            ? 'border-premium-900 bg-premium-50'
                                            : 'border-premium-200 hover:border-premium-400'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-premium-900' : 'text-premium-400'}`} />
                                        <span className={`text-[10px] font-semibold text-center leading-tight ${isSelected ? 'text-premium-900' : 'text-premium-500'}`}>
                                            {type}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    {/* Thời gian */}
                    <Section title="Thời gian thuê">
                        <div className="grid grid-cols-5 gap-2">
                            {TIME_OF_DAY_OPTIONS.map((opt) => {
                                const isSelected = draftFilters.timeOfDay.includes(opt.label);
                                return (
                                    <button
                                        key={opt.label}
                                        type="button"
                                        onClick={() => toggleArray('timeOfDay', opt.label)}
                                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all cursor-pointer gap-1 ${isSelected
                                            ? 'border-premium-900 bg-premium-50 text-premium-900'
                                            : 'border-premium-200 text-premium-400 hover:border-premium-400'
                                            }`}
                                    >
                                        <opt.icon className="w-4 h-4" />
                                        <span className={`text-[9px] font-semibold text-center leading-tight ${isSelected ? 'text-premium-900' : 'text-premium-500'}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    {/* Khoảng giá */}
                    <Section title="Khoảng giá">
                        {/* Manual input */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="text-[10px] font-semibold text-premium-400 uppercase tracking-wide block mb-1">Từ</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="0"
                                        value={formatCurrencyInput(draftFilters.priceMin)}
                                        onChange={e => set('priceMin', e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-3 pr-6 py-2 bg-white border border-premium-200 rounded-xl text-sm text-premium-900 focus:outline-none focus:ring-1 focus:ring-premium-400 focus:border-premium-400"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-premium-300">đ</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-premium-400 uppercase tracking-wide block mb-1">Đến</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Không giới hạn"
                                        value={formatCurrencyInput(draftFilters.priceMax)}
                                        onChange={e => set('priceMax', e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-3 pr-6 py-2 bg-white border border-premium-200 rounded-xl text-sm text-premium-900 focus:outline-none focus:ring-1 focus:ring-premium-400 focus:border-premium-400"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-premium-300">đ</span>
                                </div>
                            </div>
                        </div>
                        {/* Presets */}
                        <div className="flex flex-wrap gap-1.5">
                            {PRICE_PRESETS.map((preset) => {
                                const isSelected = draftFilters.priceMin === preset.min && draftFilters.priceMax === preset.max;
                                return (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => { set('priceMin', preset.min); set('priceMax', preset.max); }}
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${isSelected
                                            ? 'bg-premium-900 text-white border-premium-900'
                                            : 'bg-white text-premium-600 border-premium-200 hover:border-premium-400'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </Section>

                    {/* Phù hợp cho */}
                    <Section title="Phù hợp cho" collapsible defaultExpanded={false}>
                        <div className="flex flex-wrap gap-2">
                            {SUITABLE_FOR_OPTIONS.map(opt => (
                                <Chip
                                    key={opt}
                                    label={opt}
                                    selected={draftFilters.suitableFor.includes(opt)}
                                    onClick={() => toggleArray('suitableFor', opt)}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* Tiện ích */}
                    <Section title="Tiện ích" collapsible defaultExpanded={false}>
                        <div className="flex flex-wrap gap-2">
                            {AMENITIES.map(opt => (
                                <Chip
                                    key={opt}
                                    label={opt}
                                    selected={draftFilters.amenities.includes(opt)}
                                    onClick={() => toggleArray('amenities', opt)}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* Gần khu vực */}
                    <Section title="Gần khu vực" collapsible defaultExpanded={false}>
                        <div className="flex flex-wrap gap-2">
                            {NEARBY_FEATURES.map(opt => (
                                <Chip
                                    key={opt}
                                    label={opt}
                                    selected={draftFilters.nearbyFeatures.includes(opt)}
                                    onClick={() => toggleArray('nearbyFeatures', opt)}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* bottom breathing room */}
                    <div className="h-2" />
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-4 border-t border-premium-100 flex items-center justify-between flex-shrink-0 bg-white">
                    <span className="text-xs text-premium-400 font-medium">
                        {draftFilters.province
                            ? `${draftFilters.province}${draftFilters.geoSystem === 'old' && draftFilters.district.length > 0 ? ` · ${draftFilters.district.length} quận` : ''}${draftFilters.geoSystem === 'new' && draftFilters.ward.length > 0 ? ` · ${draftFilters.ward.length} phường` : ''}`
                            : 'Chưa chọn khu vực'
                        }
                    </span>
                    <button
                        onClick={() => executeSearch(draftFilters)}
                        disabled={!canSubmit || isLoading}
                        className="px-6 py-2.5 bg-premium-900 text-white rounded-xl font-semibold text-sm hover:bg-premium-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Xem kết quả'
                        )}
                    </button>
                </div>

                {/* ================================================================
                    Location Sub-layer (Province / District picker)
                ================================================================ */}
                {locationStep !== 'none' && (
                    <div className="absolute inset-0 bg-white z-[110] flex flex-col sm:rounded-2xl rounded-t-2xl animate-fade-in">

                        {/* Sub-header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-premium-100 flex-shrink-0">
                            <button
                                onClick={locationStep === 'district' ? handleBackFromDistrict : handleBackFromProvince}
                                className="p-1.5 rounded-full hover:bg-premium-100 text-premium-600 transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 text-center">
                                <p className="text-sm font-semibold text-premium-900">
                                    {locationStep === 'province' ? 'Chọn tỉnh/thành phố' : draftFilters.province}
                                </p>
                                {locationStep === 'district' && (
                                    <p className="text-[10px] text-premium-400 mt-0.5">
                                        {draftFilters.geoSystem === 'old' ? 'Quận/Huyện (tùy chọn)' : 'Phường/Xã (bắt buộc)'}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleCloseSubLayer}
                                className="p-1.5 rounded-full hover:bg-premium-100 text-premium-400 hover:text-premium-900 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Geo toggle — only in province step */}
                        {locationStep === 'province' && (
                            <div className="px-5 pt-4 pb-2 flex-shrink-0">
                                <div className="flex bg-premium-100 p-0.5 rounded-xl w-fit">
                                    <button
                                        onClick={() => handleSwitchGeoSystem('old')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${draftFilters.geoSystem === 'old'
                                            ? 'bg-white text-premium-900 shadow-sm'
                                            : 'text-premium-400 hover:text-premium-700'
                                            }`}
                                    >
                                        🏛 Hành chính cũ
                                    </button>
                                    <button
                                        onClick={() => handleSwitchGeoSystem('new')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${draftFilters.geoSystem === 'new'
                                            ? 'bg-white text-premium-900 shadow-sm'
                                            : 'text-premium-400 hover:text-premium-700'
                                            }`}
                                    >
                                        🗺 Hành chính mới
                                    </button>
                                </div>
                                <p className="text-[10px] text-premium-400 mt-1.5 ml-0.5">
                                    {draftFilters.geoSystem === 'new'
                                        ? 'Hệ mới: phường/xã bắt buộc chọn'
                                        : 'Hệ cũ: quận/huyện tùy chọn'}
                                </p>
                            </div>
                        )}

                        {/* Search input */}
                        <div className="px-5 pt-3 pb-2 flex-shrink-0">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-300" />
                                <input
                                    type="text"
                                    placeholder={locationStep === 'province' ? 'Tìm tỉnh/thành phố...' : 'Tìm quận/huyện/phường...'}
                                    value={locationSearch}
                                    onChange={e => setLocationSearch(e.target.value)}
                                    autoFocus
                                    className="w-full pl-9 pr-3 py-2.5 bg-premium-50 border border-premium-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-premium-400"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto px-3 py-1">
                            {locationStep === 'province' ? (
                                filteredProvinces.length > 0 ? filteredProvinces.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handleSelectProvince(p)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left transition-all cursor-pointer ${draftFilters.province === p
                                            ? 'bg-premium-50 text-premium-900'
                                            : 'hover:bg-premium-50 text-premium-600'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{p}</span>
                                        {draftFilters.province === p && <Check className="w-4 h-4 text-premium-900" />}
                                    </button>
                                )) : (
                                    <div className="text-center py-10 text-premium-400 text-sm">Không tìm thấy tỉnh/thành phố</div>
                                )
                            ) : (
                                filteredDistricts.length > 0 ? filteredDistricts.map(d => {
                                    const isSelected = draftFilters.geoSystem === 'old'
                                        ? draftFilters.district.includes(d)
                                        : draftFilters.ward.includes(d);
                                    return (
                                        <button
                                            key={d}
                                            onClick={() => handleToggleDistrict(d)}
                                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left transition-all cursor-pointer ${isSelected
                                                ? 'bg-premium-50 text-premium-900'
                                                : 'hover:bg-premium-50 text-premium-600'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{d}</span>
                                            {isSelected && <Check className="w-4 h-4 text-premium-900" />}
                                        </button>
                                    );
                                }) : (
                                    <div className="text-center py-10 text-premium-400 text-sm">Không tìm thấy kết quả</div>
                                )
                            )}
                        </div>

                        {/* Sub-footer */}
                        <div className="px-5 py-4 border-t border-premium-100 flex items-center justify-between flex-shrink-0 bg-white">
                            <div>
                                {locationStep === 'province' && !draftFilters.province && (
                                    <p className="text-xs text-red-400 font-medium">⚠ Vui lòng chọn tỉnh/thành để tiếp tục</p>
                                )}
                                {locationStep === 'district' && (
                                    <p className="text-xs text-premium-500">
                                        Đã chọn {draftFilters.geoSystem === 'old' ? draftFilters.district.length : draftFilters.ward.length}/5
                                        {draftFilters.geoSystem === 'new' && (
                                            <span className="text-red-400 ml-1">· bắt buộc ≥ 1</span>
                                        )}
                                    </p>
                                )}
                            </div>

                            {locationStep === 'district' && (
                                <button
                                    onClick={() => setLocationStep('none')}
                                    disabled={draftFilters.geoSystem === 'new' && draftFilters.ward.length === 0}
                                    className="px-6 py-2.5 bg-premium-900 text-white rounded-xl font-semibold text-sm hover:bg-premium-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    Xác nhận
                                </button>
                            )}
                            {locationStep === 'province' && draftFilters.province && (
                                <button
                                    onClick={() => setLocationStep('none')}
                                    className="px-6 py-2.5 bg-premium-900 text-white rounded-xl font-semibold text-sm hover:bg-premium-800 transition-all cursor-pointer"
                                >
                                    Tiếp tục →
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
