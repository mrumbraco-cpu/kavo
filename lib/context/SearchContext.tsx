'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SearchFilters, DEFAULT_FILTERS, SearchResult } from '@/types/search';
import { Listing } from '@/types/listing';

interface SearchContextType {
    filters: SearchFilters;
    setFilters: (filters: SearchFilters) => void;
    globalListings: Listing[];
    total: number;
    isLoading: boolean;
    error: string | null;
    hasSearched: boolean;
    executeSearch: (filters: SearchFilters) => Promise<void>;
    isModalOpen: boolean;
    setModalOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
    const [globalListings, setGlobalListings] = useState<Listing[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);

    const executeSearch = useCallback(async (searchFilters: SearchFilters) => {
        setIsLoading(true);
        setError(null);
        setFilters(searchFilters);

        try {
            const params = new URLSearchParams({
                geoSystem: searchFilters.geoSystem,
                province: searchFilters.province,
                ...(searchFilters.district ? { district: searchFilters.district } : {}),
                ...(searchFilters.ward ? { ward: searchFilters.ward } : {}),
                ...(searchFilters.query.trim() ? { query: searchFilters.query.trim() } : {}),
                ...(searchFilters.spaceTypes.length ? { spaceTypes: searchFilters.spaceTypes.join(',') } : {}),
                ...(searchFilters.locationTypes.length ? { locationTypes: searchFilters.locationTypes.join(',') } : {}),
                ...(searchFilters.suitableFor.length ? { suitableFor: searchFilters.suitableFor.join(',') } : {}),
                ...(searchFilters.notSuitableFor.length ? { notSuitableFor: searchFilters.notSuitableFor.join(',') } : {}),
                ...(searchFilters.amenities.length ? { amenities: searchFilters.amenities.join(',') } : {}),
                ...(searchFilters.timeOfDay.length ? { timeOfDay: searchFilters.timeOfDay.join(',') } : {}),
                ...(searchFilters.priceMin ? { priceMin: searchFilters.priceMin } : {}),
                ...(searchFilters.priceMax ? { priceMax: searchFilters.priceMax } : {}),
                allResults: 'true',
            });

            const res = await fetch(`/api/search?${params.toString()}`);
            if (!res.ok) throw new Error('Tìm kiếm thất bại, vui lòng thử lại.');

            const data: SearchResult = await res.json();
            setGlobalListings(data.listings);
            setTotal(data.total ?? data.listings.length);
            setHasSearched(true);
            setModalOpen(false); // Close modal on success

            // Navigate to /search if not already there
            if (pathname !== '/search') {
                router.push('/search');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <SearchContext.Provider
            value={{
                filters,
                setFilters,
                globalListings,
                total,
                isLoading,
                error,
                hasSearched,
                executeSearch,
                isModalOpen,
                setModalOpen,
            }}
        >
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
