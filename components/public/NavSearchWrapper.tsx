'use client';

import dynamic from 'next/dynamic';
import { useSearch } from '@/lib/context/SearchContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import HeaderSearch from './HeaderSearch';

const SearchModal = dynamic(() => import('./SearchModal'));

export default function NavSearchWrapper() {
    const { isModalOpen } = useSearch();
    const pathname = usePathname();

    return (
        <div className="flex items-center">
            {pathname === '/search' && <HeaderSearch />}
            {isModalOpen && <SearchModal />}
        </div>
    );
}
