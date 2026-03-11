'use client';

import React from 'react';

interface UrgencyBadgeProps {
    unlockCount: number;
    threshold: number;
}

const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ unlockCount, threshold }) => {
    const isRare = unlockCount >= threshold;

    if (isRare) {
        return (
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-gray-200 bg-rose-50 shadow-sm">
                <div className="flex-shrink-0">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rose-500" fill="currentColor">
                        <path d="M16 3.03l-1.39 1.43L6.07 13.01H1.2c-.66 0-1.2.54-1.2 1.2v0.01c0 0.32 0.13 0.62 0.35 0.84l15.01 15.01c0.11 0.11 0.24 0.2 0.38 0.26 0.08 0.04 0.17 0.07 0.26 0.09 0.15 0.03 0.3 0.03 0.45 0 0.09-0.02 0.18-0.05 0.26-0.09 0.14-0.06 0.27-0.15 0.38-0.26l15.01-15.01c0.22-0.22 0.35-0.52 0.35-0.84V14.21c0-0.66-0.54-1.2-1.2-1.2h-4.87l-8.54-8.55-1.39-1.43zM16 6.42l5.04 5.04H10.96L16 6.42zM5.44 14.21h4.63l-4.63 4.63v-4.63zM21.93 14.21h4.63v4.63l-4.63-4.63zM16 26.54l-7.7-7.7 7.7-7.7 7.7 7.7-7.7 7.7z" />
                    </svg>
                </div>
                <div className="flex-grow">
                    <p className="text-[15px] font-semibold text-gray-900 leading-tight">
                        Hiếm khi còn chỗ!
                    </p>
                    <p className="text-sm text-gray-700 mt-0.5">
                        Nhanh tay liên hệ chủ ngay

                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <div className="flex-grow">
                <p className="text-[15px] font-semibold text-gray-900 leading-tight">
                    Còn 1 slot
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                    Nhanh tay liên hệ chủ ngay
                </p>
            </div>
        </div>
    );
};

export default UrgencyBadge;
