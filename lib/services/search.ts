import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SearchFilters, SearchResult } from '@/types/search';
import { Listing } from '@/types/listing';

export async function getSearchResults(filters: Partial<SearchFilters>, page: number = 1, pageSize: number = 12, allResults: boolean = false): Promise<SearchResult> {
    const supabase = await createServerSupabaseClient();

    const geoSystem = filters.geoSystem || 'old';
    const province = filters.province || '';
    const districts = filters.district || [];
    const wards = filters.ward || [];
    const query = filters.query || '';
    const spaceTypes = filters.spaceTypes || [];
    const locationTypes = filters.locationTypes || [];
    const amenities = filters.amenities || [];
    const nearbyFeatures = filters.nearbyFeatures || [];
    const rentalModes = filters.rentalModes || [];
    const priceMin = filters.priceMin || '';
    const priceMax = filters.priceMax || '';
    const timeOfDay = filters.timeOfDay || [];

    // Map user-friendly labels to internal session names
    const timeMapping: Record<string, string> = {
        'Buổi sáng': 'Sáng',
        'Buổi trưa': 'Trưa',
        'Buổi chiều': 'Chiều',
        'Buổi tối': 'Tối',
        'Nguyên ngày': 'Cả ngày',
    };

    // Validate geography: province is mandatory
    if (!province) {
        return { listings: [], markers: [], total: 0 };
    }

    let dbQuery = supabase
        .from('listings')
        .select('id, title, description, status, is_hidden, space_type, location_type, province_old, district_old, province_new, ward_new, detailed_address, price_min, price_max, suitable_for, not_suitable_for, rental_modes, amenities, nearby_features, time_slots, images, latitude, longitude, unlock_count')
        .in('status', ['approved', 'expired'])
        .eq('is_hidden', false);

    // --- Geography filters ---
    if (geoSystem === 'old') {
        if (province) dbQuery = dbQuery.eq('province_old', province);
        if (districts.length > 0) {
            dbQuery = dbQuery.in('district_old', districts);
        }
    } else {
        if (province) dbQuery = dbQuery.eq('province_new', province);
        if (wards.length > 0) {
            dbQuery = dbQuery.in('ward_new', wards);
        }
    }



    if (spaceTypes.length > 0) {
        dbQuery = dbQuery.overlaps('space_type', spaceTypes);
    }

    if (locationTypes.length > 0) {
        dbQuery = dbQuery.in('location_type', locationTypes);
    }

    if (amenities.length > 0) {
        dbQuery = dbQuery.overlaps('amenities', amenities);
    }

    if (nearbyFeatures.length > 0) {
        dbQuery = dbQuery.overlaps('nearby_features', nearbyFeatures);
    }

    if (rentalModes.length > 0) {
        dbQuery = dbQuery.overlaps('rental_modes', rentalModes);
    }

    if (priceMin && priceMax) {
        dbQuery = dbQuery
            .lte('price_min', parseInt(priceMax, 10))
            .gte('price_max', parseInt(priceMin, 10));
    } else if (priceMin) {
        dbQuery = dbQuery.gte('price_max', parseInt(priceMin, 10));
    } else if (priceMax) {
        dbQuery = dbQuery.lte('price_min', parseInt(priceMax, 10));
    }

    dbQuery = dbQuery.order('id', { ascending: false });

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Search service error:', error);
        throw new Error('Search failed');
    }

    let results = data ?? [];

    if (query.trim()) {
        const normalizedQuery = stripSpaces(normalizeVietnamese(query));
        results = results.filter(listing => {
            const titleNorm = stripSpaces(normalizeVietnamese(listing.title ?? ''));
            const descNorm = stripSpaces(normalizeVietnamese(listing.description ?? ''));
            const addrNorm = stripSpaces(normalizeVietnamese(listing.detailed_address ?? ''));
            return (
                titleNorm.includes(normalizedQuery) ||
                descNorm.includes(normalizedQuery) ||
                addrNorm.includes(normalizedQuery)
            );
        });
    }

    if (timeOfDay.length > 0) {
        const requiredSessions = timeOfDay.map(t => timeMapping[t]).filter(Boolean);
        results = results.filter(listing => {
            const slots = listing.time_slots as string[] ?? [];
            return requiredSessions.some(session =>
                slots.some(slot => slot.includes(`|${session}`))
            );
        });
    }

    const total = results.length;

    // Create markers from ALL filtered results
    const markers = results.map(listing => ({
        id: listing.id,
        latitude: listing.latitude,
        longitude: listing.longitude,
        title: listing.title,
        status: listing.status,
        space_type: listing.space_type,
        location_type: listing.location_type,
        price_min: listing.price_min,
        price_max: listing.price_max,
        images: listing.images,
        rental_modes: listing.rental_modes,
        unlock_count: listing.unlock_count ?? 0
    }));

    // Slicing for pagination
    const offset = (page - 1) * pageSize;
    const paginatedResults = results.slice(offset, offset + pageSize);

    const listings = paginatedResults.map(listing => ({
        id: listing.id,
        title: listing.title,
        status: listing.status,
        space_type: listing.space_type,
        location_type: listing.location_type,
        detailed_address: listing.detailed_address,
        price_min: listing.price_min,
        price_max: listing.price_max,
        images: listing.images,
        latitude: listing.latitude,
        longitude: listing.longitude,
        time_slots: listing.time_slots,
        nearby_features: listing.nearby_features,
        rental_modes: listing.rental_modes,
        amenities: listing.amenities,
    }));

    return { listings: listings as unknown as Listing[], markers: markers as unknown as Listing[], total };
}

function normalizeVietnamese(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .normalize('NFC')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function stripSpaces(text: string): string {
    return text.replace(/\s/g, '');
}
