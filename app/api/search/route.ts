import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = request.nextUrl;

    const geoSystem = searchParams.get('geoSystem') || 'old';
    const province = searchParams.get('province') || '';
    const district = searchParams.get('district') || '';
    const ward = searchParams.get('ward') || '';
    const query = searchParams.get('query') || '';
    const spaceTypes = searchParams.get('spaceTypes')?.split(',').filter(Boolean) || [];
    const locationTypes = searchParams.get('locationTypes')?.split(',').filter(Boolean) || [];
    const suitableFor = searchParams.get('suitableFor')?.split(',').filter(Boolean) || [];
    const notSuitableFor = searchParams.get('notSuitableFor')?.split(',').filter(Boolean) || [];
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];
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

    let dbQuery = supabase
        .from('listings')
        .select('id, title, description, status, is_hidden, space_type, location_type, address_old_admin, province_old, district_old, address_new_admin, province_new, ward_new, price_min, price_max, suitable_for, not_suitable_for, amenities, time_slots, images, latitude, longitude')
        .eq('status', 'approved')
        .eq('is_hidden', false);

    // --- Geography filters ---
    if (geoSystem === 'old') {
        if (province) dbQuery = dbQuery.eq('province_old', province);
        if (district) dbQuery = dbQuery.eq('district_old', district);
    } else {
        // new admin
        if (province) dbQuery = dbQuery.eq('province_new', province);
        if (ward) dbQuery = dbQuery.eq('ward_new', ward);
    }

    // --- Hard exclusion: not_suitable_for (must match ALL values in notSuitableFor cannot appear) ---
    if (notSuitableFor.length > 0) {
        // Exclude listings where not_suitable_for overlaps with any of the user's selections
        dbQuery = dbQuery.not('not_suitable_for', 'ov', `{${notSuitableFor.map(v => `"${v}"`).join(',')}}`);
    }

    // --- Space type filter ---
    if (spaceTypes.length > 0) {
        dbQuery = dbQuery.in('space_type', spaceTypes);
    }

    // --- Location type filter ---
    if (locationTypes.length > 0) {
        dbQuery = dbQuery.in('location_type', locationTypes);
    }

    // --- Amenities filter ---
    if (amenities.length > 0) {
        // Listing must contain all selected amenities
        dbQuery = dbQuery.contains('amenities', amenities);
    }

    // --- Price filter ---
    if (priceMin) dbQuery = dbQuery.gte('price_min', parseInt(priceMin, 10));
    if (priceMax) dbQuery = dbQuery.lte('price_max', parseInt(priceMax, 10));

    // --- Text search (accent/case insensitive via ilike) ---
    // Supabase does not have built-in unaccent in public, so we use ilike on multiple columns
    if (query) {
        const q = `%${query}%`;
        dbQuery = dbQuery.or(
            `title.ilike.${q},description.ilike.${q},address_old_admin.ilike.${q},address_new_admin.ilike.${q},province_old.ilike.${q},province_new.ilike.${q}`
        );
    }

    // --- Suitable for (ranking boost — select all, boost matching with ordering) ---
    // Note: suitable_for is a ranking boost only per SEARCH_AND_FILTER_BEHAVIOR.md.
    // We fetch all matches and sort boosted ones first in-memory.

    // Order: suitable_for matched listings come first, then rest
    dbQuery = dbQuery.order('id', { ascending: false }); // deterministic fallback order

    // Fetch data
    const { data, error } = await dbQuery;

    if (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    let results = data ?? [];

    // --- Time of Day filter (in-memory) ---
    if (timeOfDay.length > 0) {
        const requiredSessions = timeOfDay.map(t => timeMapping[t]).filter(Boolean);
        results = results.filter(listing => {
            const slots = listing.time_slots as string[] ?? [];
            // Check if any slot matches any of the required sessions
            return requiredSessions.some(session =>
                slots.some(slot => slot.includes(`|${session}`))
            );
        });
    }

    // --- Suitable for ranking boost (in-memory sort) ---
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
