import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

                {/* ── Main 2-column layout ────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-x-14 gap-y-10">

                    {/* ────── LEFT COLUMN ─────────────────────────────── */}
                    <div className="min-w-0">
                        {/* Top Actions Skeleton */}
                        <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-5">
                            <div className="h-10 w-32 bg-gray-100 rounded-full animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
                                <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
                            </div>
                        </div>

                        {/* Title Skeleton */}
                        <div className="mb-4 space-y-2">
                            <div className="h-8 w-3/4 bg-gray-100 rounded-md animate-pulse" />
                            <div className="h-8 w-1/2 bg-gray-100 rounded-md animate-pulse" />
                        </div>

                        {/* Badges Skeleton */}
                        <div className="flex gap-3 mb-5">
                            <div className="h-5 w-20 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="h-5 w-24 bg-gray-100 rounded-lg animate-pulse" />
                        </div>

                        {/* Image Gallery Skeleton */}
                        <div className="mb-8 rounded-2xl bg-gray-100 h-[300px] sm:h-[450px] w-full animate-pulse" />

                        {/* Price section Skeleton */}
                        <div className="pb-8 border-b border-gray-100">
                            <div className="h-4 w-32 bg-gray-100 rounded-md mb-2 animate-pulse" />
                            <div className="h-10 w-48 bg-gray-100 rounded-md mb-4 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-56 bg-gray-100 rounded-md animate-pulse" />
                                <div className="h-4 w-40 bg-gray-100 rounded-md animate-pulse" />
                            </div>
                        </div>

                        {/* Space & Location Details Skeleton */}
                        <div className="py-8 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                                    <div className="space-y-1">
                                        <div className="h-3 w-16 bg-gray-100 rounded-md animate-pulse" />
                                        <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Description Skeleton */}
                        <div className="py-8 border-b border-gray-100 space-y-2">
                            <div className="h-6 w-40 bg-gray-100 rounded-md mb-4 animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse" />
                            <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse" />
                            <div className="h-4 w-2/3 bg-gray-100 rounded-md animate-pulse" />
                        </div>
                    </div>

                    {/* ────── RIGHT COLUMN ────────────────────────────── */}
                    <div className="lg:block">
                        <div className="sticky top-24 flex flex-col gap-4">
                            <div className="h-20 w-full bg-gray-100 rounded-2xl animate-pulse" />
                            <div className="h-24 w-full bg-gray-100 rounded-2xl animate-pulse" />
                            <div className="h-60 w-full bg-gray-100 rounded-2xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
