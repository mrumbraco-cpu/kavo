'use client';

import React, { createContext, useContext, useState } from 'react';

interface ListingDetailContextType {
    isTopMapVisible: boolean;
    setIsTopMapVisible: (visible: boolean) => void;
}

const ListingDetailContext = createContext<ListingDetailContextType | undefined>(undefined);

export function ListingDetailProvider({ children }: { children: React.ReactNode }) {
    const [isTopMapVisible, setIsTopMapVisible] = useState(false);

    return (
        <ListingDetailContext.Provider value={{ isTopMapVisible, setIsTopMapVisible }}>
            {children}
        </ListingDetailContext.Provider>
    );
}

export function useListingDetail() {
    const context = useContext(ListingDetailContext);
    if (context === undefined) {
        throw new Error('useListingDetail must be used within a ListingDetailProvider');
    }
    return context;
}
