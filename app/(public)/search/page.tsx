import type { Metadata } from 'next';
import SearchClient from '@/components/public/SearchClient';
import { Suspense } from 'react';
import { getSearchResults } from '@/lib/services/search';
import { SearchFilters } from '@/types/search';

export const metadata: Metadata = {
    title: 'Tìm kiếm không gian – CHOBAN.VN',
    description: 'Khám phá và kết nối trực tiếp với các không gian kinh doanh, workshop, kệ hàng, vỉa hè tại Việt Nam.',
};

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;

    const parseArray = (val: string | string[] | undefined): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return val.split(',').filter(Boolean);
    };

    const filters: Partial<SearchFilters> = {
        geoSystem: (resolvedParams.geoSystem as 'old' | 'new') || 'old',
        province: typeof resolvedParams.province === 'string' ? resolvedParams.province : '',
        district: parseArray(resolvedParams.district),
        ward: parseArray(resolvedParams.ward),
        query: typeof resolvedParams.query === 'string' ? resolvedParams.query : '',
        spaceTypes: parseArray(resolvedParams.spaceTypes),
        locationTypes: parseArray(resolvedParams.locationTypes),
        amenities: parseArray(resolvedParams.amenities),
        nearbyFeatures: parseArray(resolvedParams.nearbyFeatures),
        timeOfDay: parseArray(resolvedParams.timeOfDay),
        priceMin: typeof resolvedParams.priceMin === 'string' ? resolvedParams.priceMin : '',
        priceMax: typeof resolvedParams.priceMax === 'string' ? resolvedParams.priceMax : '',
    };

    const pageParam = resolvedParams.page;
    const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam;
    const page = typeof pageStr === 'string' ? parseInt(pageStr, 10) : 1;

    const defaultPageSize = Number(process.env.NEXT_PUBLIC_LISTINGS_PER_PAGE || 12);
    const pageSizeParam = resolvedParams.pageSize;
    const pageSizeStr = Array.isArray(pageSizeParam) ? pageSizeParam[0] : pageSizeParam;
    const pageSize = typeof pageSizeStr === 'string' ? parseInt(pageSizeStr, 10) : defaultPageSize;

    let initialData: { listings: any[]; markers: any[]; total: number } = { listings: [], markers: [], total: 0 };
    if (filters.province) {
        try {
            initialData = await getSearchResults(filters, page, pageSize, true);
        } catch (e) {
            console.error('SSR Pre-fetch failed', e);
        }
    }

    return (
        <Suspense fallback={<div className="h-screen bg-white" />}>
            <SearchClient ssrListings={initialData.listings} ssrMarkers={initialData.markers} ssrTotal={initialData.total} initialPage={page} />
        </Suspense>
    );
}
