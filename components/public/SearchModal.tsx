'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/lib/context/SearchContext';
import { AMENITIES, NEARBY_FEATURES } from '@/lib/constants/facilities';
import { SearchFilters } from '@/types/search';
import GeographySelector from './GeographySelector';
import PriceRangeSelector from './PriceRangeSelector';
import { SPACE_TYPES, LOCATION_TYPES, SUITABLE_FOR_OPTIONS } from '@/lib/constants/listing-options';

const TIME_OF_DAY_OPTIONS = [
    {
        label: 'Buổi sáng',
        icon: (props: any) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        label: 'Buổi trưa',
        icon: (props: any) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        label: 'Buổi chiều',
        icon: (props: any) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        label: 'Buổi tối',
        icon: (props: any) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        )
    },
    {
        label: 'Nguyên ngày',
        icon: (props: any) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    },
];

const LOCATION_ICONS: Record<string, any> = {
    'Mặt tiền': (props: any) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    'Hẻm xe hơi': (props: any) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    'Hẻm xe máy': (props: any) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    'Trong tòa nhà': (props: any) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    'Khác': (props: any) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
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
                    <svg className={`w-4 h-4 text-premium-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
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

    useEffect(() => {
        if (isModalOpen) {
            setDraftFilters(confirmedFilters);
        }
    }, [isModalOpen, confirmedFilters]);

    const handleApply = () => {
        executeSearch(draftFilters);
        setModalOpen(false);
    };

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
            geoSystem: confirmedFilters.geoSystem || 'old',
            province: '',
            district: [],
            ward: [],
            query: '',
            spaceTypes: [],
            locationTypes: [],
            timeOfDay: [],
            amenities: [],
            nearbyFeatures: [],
            suitableFor: [],
            notSuitableFor: [],
            priceMin: '',
            priceMax: '',
        });
    };

    const handleToggleDistrict = (d: string) => {
        const key = draftFilters.geoSystem === 'new' ? 'ward' : 'district';
        const current = draftFilters[key] as string[];
        if (current.includes(d)) {
            set(key, current.filter(x => x !== d) as any);
        } else {
            if (current.length >= 5) return;
            set(key, [...current, d] as any);
        }
    };

    const canApply = draftFilters.province !== '' &&
        (draftFilters.geoSystem === 'old' || draftFilters.ward.length > 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={() => setModalOpen(false)}
            />

            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-fade-up rounded-t-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-premium-100 flex-shrink-0">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="p-1.5 rounded-full hover:bg-premium-100 text-premium-400 hover:text-premium-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-sm font-semibold text-premium-900 absolute left-1/2 -translate-x-1/2">Bộ lọc</h2>
                    <button
                        onClick={handleClearAll}
                        className="text-xs font-semibold text-premium-600 hover:text-premium-900 underline"
                    >
                        Xóa tất cả
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5">
                    <Section title="Khu vực">
                        <GeographySelector
                            filters={draftFilters}
                            onUpdate={set}
                            onToggleDistrict={handleToggleDistrict}
                            onProvinceChange={(p) => {
                                if (draftFilters.province === p) {
                                    // Toggle off
                                    setDraftFilters(prev => ({
                                        ...prev,
                                        province: '',
                                        district: [],
                                        ward: []
                                    }));
                                } else {
                                    // Change province
                                    setDraftFilters(prev => ({
                                        ...prev,
                                        province: p,
                                        district: [],
                                        ward: []
                                    }));
                                }
                            }}
                            onSwitchSystem={(s) => {
                                setDraftFilters(prev => ({
                                    ...prev,
                                    geoSystem: s,
                                    province: '',
                                    district: [],
                                    ward: []
                                }));
                            }}
                        />
                    </Section>

                    <Section title="Từ khóa">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Tiêu đề, địa chỉ, tên đường…"
                                value={draftFilters.query}
                                onChange={e => set('query', e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-premium-200 rounded-xl text-sm"
                            />
                        </div>
                    </Section>

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

                    <Section title="Vị trí mặt bằng">
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {LOCATION_TYPES.map((type) => {
                                const DefaultIcon = (props: any) => (
                                    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                );
                                const Icon = LOCATION_ICONS[type] || DefaultIcon;
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

                    <Section title="Khoảng giá">
                        <PriceRangeSelector
                            minPrice={draftFilters.priceMin}
                            maxPrice={draftFilters.priceMax}
                            onUpdate={(key, val) => {
                                const filterKey = key === 'min_price' ? 'priceMin' : 'priceMax';
                                set(filterKey, val);
                            }}
                        />
                    </Section>

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
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-premium-100 bg-premium-50/50 flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3 pl-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${draftFilters.province ? 'bg-premium-900 text-white' : 'bg-premium-100 text-premium-400'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-bold text-premium-400 uppercase tracking-widest leading-none mb-1">Khu vực</span>
                            <span className="text-sm font-bold text-premium-900 truncate max-w-[150px]">
                                {draftFilters.province || 'Toàn quốc'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleApply}
                        disabled={!canApply || isLoading}
                        className="flex-1 py-3 px-6 bg-premium-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-premium-900/20 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                Xem kết quả
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
