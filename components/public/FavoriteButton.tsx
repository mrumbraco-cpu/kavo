'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavoriteAction } from '@/app/(public)/listings/[id]/actions';

interface FavoriteButtonProps {
    listingId: string;
    initialIsFavorite: boolean;
    isAuthenticated: boolean;
}

export default function FavoriteButton({ listingId, initialIsFavorite, isAuthenticated }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để lưu tin này.');
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
                if (result.error) alert(result.error);
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
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
            title={isFavorite ? 'Bỏ lưu tin' : 'Lưu tin này'}
        >
            <Heart
                className={`w-5 h-5 transition-all duration-300 transform group-hover:scale-110 ${isFavorite
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-500 group-hover:text-red-400'
                    }`}
            />
        </button>
    );
}
