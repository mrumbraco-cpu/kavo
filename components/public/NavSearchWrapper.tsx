'use client';

import dynamic from 'next/dynamic';
import { useSearch } from '@/lib/context/SearchContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const SearchModal = dynamic(() => import('./SearchModal'), {
    ssr: false,
});

const HeaderSearch = dynamic(() => import('./HeaderSearch'), {
    ssr: false,
});

export default function NavSearchWrapper() {
    const { isModalOpen } = useSearch();
    const [hasInteracted, setHasInteracted] = useState(false);
    const pathname = usePathname();

    // Hiển thị modal nếu nó đang mở HOẶC nếu người dùng đã từng tương tác (để prefetch)
    // Tuy nhiên để tối ưu nhất cho Lighthouse, ta chỉ thực sự render khi isModalOpen
    return (
        <div
            className="flex items-center"
            onMouseEnter={() => setHasInteracted(true)}
            onTouchStart={() => setHasInteracted(true)}
        >
            {pathname === '/search' && <HeaderSearch />}
            {(isModalOpen || hasInteracted) && <SearchModal />}
        </div>
    );
}
