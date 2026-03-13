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
        
        if (typeof window !== 'undefined') {
            // Next.js App Router injects 'idx' into window.history.state to track internal history depth
            const state = window.history.state;
            const hasInternalHistory = state && typeof state === 'object' && 'idx' in state && state.idx > 0;
            
            if (hasInternalHistory) {
                // Safe to go back, we will stay within the app
                router.back();
            } else {
                // Direct link, new tab, or external referrer. Fallback to the last known search URL if available.
                const lastSearchUrl = sessionStorage.getItem('last_search_url');
                if (lastSearchUrl) {
                    router.push(lastSearchUrl);
                } else {
                    router.push(fallbackHref);
                }
            }
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
