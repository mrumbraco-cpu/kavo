'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface BackButtonProps {
    fallbackHref?: string;
    className?: string;
    children: React.ReactNode;
}

export default function BackButton({ fallbackHref = '/search', className, children }: BackButtonProps) {
    const router = useRouter();

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // Use router.back() which will preserve the previous page's state (including search params/pagination)
        // If there's no history (e.g. direct link), fallbackHref will be used via the <a> link if we didn't prevent default,
        // but since we want to try going back first, we'll check if we can.
        
        // Note: window.history.length > 1 is a decent but not perfect indicator.
        // If it's 1, it might be a direct entry.
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    };

    return (
        <button
            onClick={handleBack}
            className={className}
        >
            {children}
        </button>
    );
}
