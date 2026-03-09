'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SearchFilters, DEFAULT_FILTERS, SearchResult } from '@/types/search';
import { Listing } from '@/types/listing';
import {
    PROVINCES_OLD_DATA,
    PROVINCES_NEW_DATA,
    DISTRICTS_OLD_DATA_BY_PROVINCE,
    WARDS_NEW_DATA_BY_PROVINCE
} from '@/lib/constants/geography';

interface SearchContextType {
    filters: SearchFilters;
    setFilters: (filters: SearchFilters) => void;
    globalListings: Listing[];
    allMarkers: Listing[];
    total: number;
    isLoading: boolean;
    error: string | null;
    hasSearched: boolean;
    executeSearch: (filters: SearchFilters, page?: number) => Promise<void>;
    isModalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    isInitialized: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
    const [globalListings, setGlobalListings] = useState<Listing[]>([]);
    const [allMarkers, setAllMarkers] = useState<Listing[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize from localStorage AND URL on mount
    useEffect(() => {
        const saved = localStorage.getItem('search_filters_v1');
        let initialFilters = DEFAULT_FILTERS;

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                initialFilters = { ...DEFAULT_FILTERS, ...parsed };
            } catch (e) {
                console.error('Failed to parse saved filters', e);
            }
        }

        // URL search params take precedence over localStorage
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('province')) {
            const rawProvince = urlParams.get('province') || '';
            const geoSystem = (urlParams.get('geoSystem') as 'old' | 'new') || initialFilters.geoSystem;

            // Resolve Province ID if it's a label
            const provinceData = geoSystem === 'old' ? PROVINCES_OLD_DATA : PROVINCES_NEW_DATA;
            const provinceId = provinceData.find(p => p.id === rawProvince)?.id ||
                provinceData.find(p => p.label === rawProvince || p.fullName === rawProvince)?.id || rawProvince;

            const rawDistricts = urlParams.get('district')?.split(',').filter(Boolean) || [];
            const resolvedDistricts = geoSystem === 'old' ? rawDistricts.map(d => {
                const list = DISTRICTS_OLD_DATA_BY_PROVINCE[provinceId] || [];
                return list.find(item => item.id === d)?.id ||
                    list.find(item => item.label === d || item.fullName === d)?.id || d;
            }) : [];

            const rawWards = urlParams.get('ward')?.split(',').filter(Boolean) || [];
            const resolvedWards = geoSystem === 'new' ? rawWards.map(w => {
                const list = WARDS_NEW_DATA_BY_PROVINCE[provinceId] || [];
                return list.find(item => item.id === w)?.id ||
                    list.find(item => item.label === w || item.fullName === w)?.id || w;
            }) : [];

            const urlFilters: Partial<SearchFilters> = {
                geoSystem,
                province: provinceId,
                district: resolvedDistricts,
                ward: resolvedWards,
                query: urlParams.get('query') || '',
                spaceTypes: urlParams.get('spaceTypes')?.split(',').filter(Boolean) || [],
                locationTypes: urlParams.get('locationTypes')?.split(',').filter(Boolean) || [],
                suitableFor: urlParams.get('suitableFor')?.split(',').filter(Boolean) || [],
                notSuitableFor: urlParams.get('notSuitableFor')?.split(',').filter(Boolean) || [],
                amenities: urlParams.get('amenities')?.split(',').filter(Boolean) || [],
                nearbyFeatures: urlParams.get('nearbyFeatures')?.split(',').filter(Boolean) || [],
                timeOfDay: urlParams.get('timeOfDay')?.split(',').filter(Boolean) || [],
                priceMin: urlParams.get('priceMin') || '',
                priceMax: urlParams.get('priceMax') || '',
            };
            initialFilters = { ...initialFilters, ...urlFilters };
        }

        setFilters(initialFilters);
        setIsInitialized(true);
    }, []);

    // Save to localStorage whenever filters change
    useEffect(() => {
        if (isInitialized && filters !== DEFAULT_FILTERS) {
            localStorage.setItem('search_filters_v1', JSON.stringify(filters));
        }
    }, [filters, isInitialized]);

    const executeSearch = useCallback(async (searchFilters: SearchFilters, page: number = 1) => {
        setIsLoading(true);
        setError(null);
        setFilters(searchFilters);

        try {
            const pageSize = process.env.NEXT_PUBLIC_LISTINGS_PER_PAGE || '12';
            const params = new URLSearchParams({
                geoSystem: searchFilters.geoSystem,
                province: searchFilters.province,
                page: page.toString(),
                pageSize: pageSize,
                ...(searchFilters.district.length ? { district: searchFilters.district.join(',') } : {}),
                ...(searchFilters.ward.length ? { ward: searchFilters.ward.join(',') } : {}),
                ...(searchFilters.query.trim() ? { query: searchFilters.query.trim() } : {}),
                ...(searchFilters.spaceTypes.length ? { spaceTypes: searchFilters.spaceTypes.join(',') } : {}),
                ...(searchFilters.locationTypes.length ? { locationTypes: searchFilters.locationTypes.join(',') } : {}),
                ...(searchFilters.suitableFor.length ? { suitableFor: searchFilters.suitableFor.join(',') } : {}),
                ...(searchFilters.notSuitableFor.length ? { notSuitableFor: searchFilters.notSuitableFor.join(',') } : {}),
                ...(searchFilters.amenities.length ? { amenities: searchFilters.amenities.join(',') } : {}),
                ...(searchFilters.nearbyFeatures.length ? { nearbyFeatures: searchFilters.nearbyFeatures.join(',') } : {}),
                ...(searchFilters.timeOfDay.length ? { timeOfDay: searchFilters.timeOfDay.join(',') } : {}),
                ...(searchFilters.priceMin ? { priceMin: searchFilters.priceMin } : {}),
                ...(searchFilters.priceMax ? { priceMax: searchFilters.priceMax } : {}),
            });

            // Update URL search params
            const searchPath = `/search?${params.toString()}`;
            if (pathname === '/search') {
                window.history.replaceState(null, '', searchPath);
            } else {
                router.push(searchPath);
            }

            const res = await fetch(`/api/search?${params.toString()}`);
            if (!res.ok) throw new Error('Tìm kiếm thất bại, vui lòng thử lại.');

            const data: { listings: Listing[]; markers: Listing[]; total: number } = await res.json();
            setGlobalListings(data.listings);
            setAllMarkers(data.markers);
            setTotal(data.total);
            setHasSearched(true);
            setModalOpen(false); // Close modal on success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
        } finally {
            setIsLoading(false);
        }
    }, [pathname, router]);

    const contextValue = React.useMemo(() => ({
        filters,
        setFilters,
        globalListings,
        allMarkers,
        total,
        isLoading,
        error,
        hasSearched,
        executeSearch,
        isModalOpen,
        setModalOpen,
        isInitialized,
    }), [
        filters,
        globalListings,
        allMarkers,
        total,
        isLoading,
        error,
        hasSearched,
        executeSearch,
        isModalOpen,
        isInitialized
    ]);

    return (
        <SearchContext.Provider value={contextValue}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
