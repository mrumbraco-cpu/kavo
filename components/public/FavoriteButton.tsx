'use client';

import { useState } from 'react';
import { toggleFavoriteAction } from '@/app/(public)/listings/[slug]/actions';

interface FavoriteButtonProps {
    listingId: string;
    initialIsFavorite: boolean;
    isAuthenticated: boolean;
}

export default function FavoriteButton({ listingId, initialIsFavorite, isAuthenticated }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);

    const [showLoginHint, setShowLoginHint] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            setShowLoginHint(true);
            setTimeout(() => setShowLoginHint(false), 3000);
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        // Optimistic UI update
        const previousState = isFavorite;
        setIsFavorite(!previousState);

        try {
            const result = await toggleFavoriteAction(listingId);

            if (!result.success) {
                // Revert on failure
                setIsFavorite(previousState);
            } else {
                setIsFavorite(result.isFavorite!);
            }
        } catch (error) {
            console.error('Lỗi khi lưu tin:', error);
            setIsFavorite(previousState); // Revert
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all active:scale-75 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                title={isFavorite ? 'Bỏ lưu tin' : 'Lưu tin này'}
            >
                <svg
                    className={`w-5 h-5 transition-all duration-300 transform group-hover:scale-110 ${isFavorite
                        ? 'text-red-500 fill-red-500 scale-110 animate-premium-pop'
                        : 'text-gray-500 group-hover:text-red-400'
                        }`}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>

            {showLoginHint && (
                <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-premium-900 text-white text-[10px] font-bold rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-center">
                    Vui lòng đăng nhập để lưu tin
                </div>
            )}
        </div>
    );
}
