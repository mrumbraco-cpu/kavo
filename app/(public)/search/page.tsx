import type { Metadata } from 'next';
import SearchClient from '@/components/public/SearchClient';

export const metadata: Metadata = {
    title: 'Tìm kiếm không gian – SPSHARE',
    description: 'Khám phá và kết nối trực tiếp với các không gian workshop, lớp học, sự kiện và nhiều hơn nữa tại Việt Nam.',
};

export default function SearchPage() {
    return <SearchClient />;
}
