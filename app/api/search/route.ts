import { NextRequest, NextResponse } from 'next/server';
import { getSearchResults } from '@/lib/services/search';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const geoSystem = (searchParams.get('geoSystem') as 'old' | 'new') || 'old';
    const province = searchParams.get('province') || '';
    const districts = searchParams.get('district')?.split(',').filter(Boolean) || [];
    const wards = searchParams.get('ward')?.split(',').filter(Boolean) || [];
    const query = searchParams.get('query') || '';
    const spaceTypes = searchParams.get('spaceTypes')?.split(',').filter(Boolean) || [];
    const locationTypes = searchParams.get('locationTypes')?.split(',').filter(Boolean) || [];
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];
    const nearbyFeatures = searchParams.get('nearbyFeatures')?.split(',').filter(Boolean) || [];
    const rentalModes = searchParams.get('rentalModes')?.split(',').filter(Boolean) || [];
    const priceMin = searchParams.get('priceMin') || '';
    const priceMax = searchParams.get('priceMax') || '';
    const timeOfDay = searchParams.get('timeOfDay')?.split(',').filter(Boolean) || [];
    const allResults = searchParams.get('allResults') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const defaultPageSize = process.env.NEXT_PUBLIC_LISTINGS_PER_PAGE || '12';
    const pageSize = parseInt(searchParams.get('pageSize') || defaultPageSize, 10);

    // Validate geography: province is mandatory
    if (!province) {
        return NextResponse.json({ error: 'Province is required' }, { status: 400 });
    }
    if (geoSystem === 'new' && wards.length === 0) {
        return NextResponse.json({ error: 'Ward is required for New system' }, { status: 400 });
    }

    try {
        const { listings, markers, total } = await getSearchResults(
            {
                geoSystem,
                province,
                district: districts,
                ward: wards,
                query,
                spaceTypes,
                locationTypes,
                amenities,
                nearbyFeatures,
                rentalModes,
                priceMin,
                priceMax,
                timeOfDay
            },
            page,
            pageSize,
            allResults
        );

        const response = NextResponse.json({ listings, markers, total });
        response.headers.set('Cache-Control', 'private, no-cache, must-revalidate, max-age=0');
        return response;
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
