'use client';

import dynamic from 'next/dynamic';
import React from 'react';

/** Skeleton loading map cho auth buttons  */
function NavAuthSkeleton() {
    return (
        <div className="flex items-center gap-4" aria-hidden="true">
            <div className="h-9 w-20 bg-premium-100 rounded-xl animate-pulse" />
        </div>
    );
}

const NavAuthDynamic = dynamic(() => import('@/components/public/NavAuth'), {
    ssr: false,
    loading: () => <NavAuthSkeleton />,
});

export default function NavAuthWrapper() {
    return <NavAuthDynamic />;
}
