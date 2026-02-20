export interface SearchFilters {
    // Geography
    geoSystem: 'old' | 'new';
    province: string;
    district: string[];
    ward: string[];
    // Text
    query: string;
    // Filters
    spaceTypes: string[];
    locationTypes: string[];
    suitableFor: string[];
    notSuitableFor: string[];
    amenities: string[];
    timeOfDay: string[]; // NEW: Buổi sáng, trưa, tối...
    priceMin: string;
    priceMax: string;
}

export const DEFAULT_FILTERS: SearchFilters = {
    geoSystem: 'old',
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
};

export interface SearchResult {
    listings: any[];
    total: number;
}
