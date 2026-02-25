import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = request.nextUrl;

    const geoSystem = searchParams.get('geoSystem') || 'old';
    const province = searchParams.get('province') || '';
    const districts = searchParams.get('district')?.split(',').filter(Boolean) || [];
    const wards = searchParams.get('ward')?.split(',').filter(Boolean) || [];
    const query = searchParams.get('query') || '';
    const spaceTypes = searchParams.get('spaceTypes')?.split(',').filter(Boolean) || [];
    const locationTypes = searchParams.get('locationTypes')?.split(',').filter(Boolean) || [];
    const suitableFor = searchParams.get('suitableFor')?.split(',').filter(Boolean) || [];
    const notSuitableFor = searchParams.get('notSuitableFor')?.split(',').filter(Boolean) || [];
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];
    const nearbyFeatures = searchParams.get('nearbyFeatures')?.split(',').filter(Boolean) || [];
    const priceMin = searchParams.get('priceMin') || '';
    const priceMax = searchParams.get('priceMax') || '';
    const timeOfDay = searchParams.get('timeOfDay')?.split(',').filter(Boolean) || [];
    const allResults = searchParams.get('allResults') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);

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
        return NextResponse.json({ error: 'Province is required' }, { status: 400 });
    }
    if (geoSystem === 'new' && wards.length === 0) {
        return NextResponse.json({ error: 'Ward is required for New system' }, { status: 400 });
    }

    let dbQuery = supabase
        .from('listings')
        .select('id, title, description, status, is_hidden, space_type, location_type, province_old, district_old, province_new, ward_new, detailed_address, price_min, price_max, suitable_for, not_suitable_for, amenities, nearby_features, time_slots, images, latitude, longitude')
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

    // --- Hard exclusion via notSuitableFor filter (explicit user exclusion) ---
    // Exclude listings where listing.not_suitable_for overlaps with user's notSuitableFor selection.
    // Logic: if user explicitly marks "Không phù hợp cho = [X]", exclude any listing
    // whose not_suitable_for contains X (any overlap).
    if (notSuitableFor.length > 0) {
        dbQuery = dbQuery.not('not_suitable_for', 'ov', `{${notSuitableFor.map(v => `"${v}"`).join(',')}}`);
    }

    // --- Hard exclusion via suitableFor cross-check ---
    // Per SEARCH_AND_FILTER_BEHAVIOR.md: not_suitable_for[] = HARD exclusion.
    // If the listing's not_suitable_for CONTAINS ALL of the user's selected suitableFor values,
    // the listing is explicitly not suitable for ALL the user's requested purposes → exclude it.
    //
    // Example: user selects suitableFor = [Trà sữa, Cafe]
    //   Listing A: not_suitable_for = [Trà sữa]         → NOT excluded (doesn't contain all)
    //   Listing B: not_suitable_for = [Trà sữa, Cafe]   → EXCLUDED (contains all user selections)
    //   Listing C: not_suitable_for = [Trà sữa, Cafe, Nhậu] → EXCLUDED (superset, still contains all)
    //
    // PostgREST operator 'cs' (contains) → NOT cs = exclude if (listing.not_suitable_for @> suitableFor)
    if (suitableFor.length > 0) {
        dbQuery = dbQuery.not('not_suitable_for', 'cs', `{${suitableFor.map(v => `"${v}"`).join(',')}}`);
    }

    // --- Space type filter (partial match = OR logic) ---
    // Listing only needs to have AT LEAST ONE of the selected space types (overlap = &&).
    if (spaceTypes.length > 0) {
        dbQuery = dbQuery.overlaps('space_type', spaceTypes);
    }

    // --- Location type filter ---
    // location_type is a single-value field; .in() = OR logic (listing needs to match any 1 selected type)
    if (locationTypes.length > 0) {
        dbQuery = dbQuery.in('location_type', locationTypes);
    }

    // --- Amenities filter (partial match = OR logic) ---
    // Listing only needs to have AT LEAST ONE of the selected amenities (overlap = &&).
    // .overlaps() uses PostgREST 'ov' operator which maps to PostgreSQL && (array overlap).
    if (amenities.length > 0) {
        dbQuery = dbQuery.overlaps('amenities', amenities);
    }

    // --- Nearby features filter (partial match = OR logic) ---
    // Listing only needs to have AT LEAST ONE of the selected nearby features (overlap = &&).
    // .overlaps() maps to PostgreSQL && operator.
    if (nearbyFeatures.length > 0) {
        dbQuery = dbQuery.overlaps('nearby_features', nearbyFeatures);
    }

    // --- Price filter (range overlap logic) ---
    // A listing matches if its price range [price_min, price_max] OVERLAPS with the filter range.
    // Overlap condition: listing.price_min <= filter.priceMax AND listing.price_max >= filter.priceMin
    //
    // Example: Listing 30k–60k, filter 50k–100k → overlap from 50k–60k → MATCH
    //
    // Cases:
    //   Both bounds set  → full range overlap check
    //   Only priceMin    → listing must have some price >= priceMin (price_max >= priceMin)
    //   Only priceMax    → listing must start within budget (price_min <= priceMax)
    if (priceMin && priceMax) {
        dbQuery = dbQuery
            .lte('price_min', parseInt(priceMax, 10))   // listing starts before filter ends
            .gte('price_max', parseInt(priceMin, 10));   // listing ends after filter starts
    } else if (priceMin) {
        dbQuery = dbQuery.gte('price_max', parseInt(priceMin, 10));
    } else if (priceMax) {
        dbQuery = dbQuery.lte('price_min', parseInt(priceMax, 10));
    }

    // Order: deterministic fallback (will be re-sorted in-memory for suitable_for boost)
    dbQuery = dbQuery.order('id', { ascending: false });

    // Fetch data
    const { data, error } = await dbQuery;

    if (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    let results = data ?? [];

    // --- Text search (in-memory, accent+case insensitive) ---
    // We perform text search in-memory using the normalize_text logic equivalent:
    // strip accents + lowercase + whitespace collapse, then check substring match.
    // This avoids needing a DB round-trip per query and handles Vietnamese diacritics.
    //
    // Note: normalize_text DB function is available (uses unaccent extension) but PostgREST
    // cannot call it as a filter on text columns directly. In-memory is the correct approach
    // for a connection-only marketplace with moderate listing counts per province.
    if (query.trim()) {
        // normalizeVietnamese collapses whitespace to single spaces;
        // stripSpaces then removes ALL spaces so comparison is fully whitespace-insensitive.
        // e.g. user types "cafevu" or "ca fe vu" → both match listing "cafe vu"
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

    // --- Time of Day filter (in-memory) ---
    if (timeOfDay.length > 0) {
        const requiredSessions = timeOfDay.map(t => timeMapping[t]).filter(Boolean);
        results = results.filter(listing => {
            const slots = listing.time_slots as string[] ?? [];
            // Partial match: listing only needs to match ANY one of the selected sessions
            return requiredSessions.some(session =>
                slots.some(slot => slot.includes(`|${session}`))
            );
        });
    }

    // --- Suitable for ranking boost (in-memory sort) ---
    // suitable_for is a RANKING BOOST ONLY — not a hard filter.
    // Listings that match any selected suitable_for value are sorted first.
    if (suitableFor.length > 0) {
        results = results.sort((a, b) => {
            const aMatch = suitableFor.some(s => (a.suitable_for as string[] ?? []).includes(s));
            const bMatch = suitableFor.some(s => (b.suitable_for as string[] ?? []).includes(s));
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
        });
    }

    const total = results.length;

    // Pagination (client-side slice for allResults=false, return full set for allResults=true)
    if (!allResults) {
        const offset = (page - 1) * pageSize;
        results = results.slice(offset, offset + pageSize);
    }

    return NextResponse.json({ listings: results, total });
}

/**
 * Normalize Vietnamese text for accent-insensitive search.
 * - Removes Vietnamese diacritics (tone marks + base modifications)
 * - Converts to lowercase
 * - Collapses all whitespace to single spaces and trims
 *
 * This mirrors the behavior of PostgreSQL's unaccent() + lower() + normalize().
 */
function normalizeVietnamese(text: string): string {
    return text
        // Decompose Unicode characters (NFD) so combining marks become separate code points
        .normalize('NFD')
        // Remove combining diacritical marks (U+0300–U+036F)
        .replace(/[\u0300-\u036f]/g, '')
        // Handle Vietnamese-specific characters that NFD alone doesn't decompose to base ASCII
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        // Re-compose (NFC) after removing marks
        .normalize('NFC')
        // Lowercase
        .toLowerCase()
        // Collapse all whitespace (including multiple spaces, tabs) to single space
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Strip all whitespace from a pre-normalized string for whitespace-insensitive comparison.
 * Call this AFTER normalizeVietnamese() so the text is already lowercased & accent-stripped.
 * e.g. "cafe vu" → "cafevu", "van  phong" → "vanphong"
 */
function stripSpaces(text: string): string {
    return text.replace(/\s/g, '');
}
