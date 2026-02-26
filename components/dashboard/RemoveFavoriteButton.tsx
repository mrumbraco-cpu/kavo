'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toggleFavoriteAction } from '@/app/(public)/listings/[slug]/actions';

export default function RemoveFavoriteButton({ listingId }: { listingId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        if (!confirm('Bạn có thực sự muốn xóa tin này khỏi danh sách yêu thích?')) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await toggleFavoriteAction(listingId);
            if (!result.success && result.error) {
                alert(result.error);
            }
            // If successful, the server action will call revalidatePath and refresh the list
        } catch (error) {
            console.error('Lỗi khi xóa tin:', error);
            alert('Đã xảy ra lỗi khi xóa tin này khỏi danh sách yêu thích.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRemove}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Xóa khỏi danh sách yêu thích"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
