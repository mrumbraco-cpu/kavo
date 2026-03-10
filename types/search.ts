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
    amenities: string[];
    nearbyFeatures: string[];
    rentalModes: string[];
    timeOfDay: string[];
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
    amenities: [],
    nearbyFeatures: [],
    rentalModes: [],
    timeOfDay: [],
    priceMin: '',
    priceMax: '',
};

export interface SearchResult {
    listings: any[];
    markers: any[];
    total: number;
}
