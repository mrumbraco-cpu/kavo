'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/utils/encryption';
import { revalidatePath } from 'next/cache';

export async function unlockContactAction(listingId: string) {
    const supabase = await createServerSupabaseClient();

    // 1. Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vui lòng đăng nhập để thực hiện.' };
    }

    // 2. Call the RPC to handle deduction and recording
    // The RPC handles: check balance, deduct coins, create transaction, create unlock record
    const { data, error } = await supabase.rpc('unlock_listing_contact', {
        p_listing_id: listingId,
    });

    if (error || !data?.success) {
        return {
            success: false,
            error: data?.error || error?.message || 'Đã xảy ra lỗi khi mở khóa.'
        };
    }

    // 3. Decrypt the results
    try {
        const decryptedData = {
            phone: data.data.phone_encrypted ? decrypt(data.data.phone_encrypted) : undefined,
            zalo: data.data.zalo_encrypted ? decrypt(data.data.zalo_encrypted) : undefined,
        };

        // 4. Revalidate the page so the server-side state updates
        revalidatePath(`/listings/${listingId}`);

        return {
            success: true,
            data: decryptedData,
        };
    } catch (err) {
        console.error('Decryption failed:', err);
        return {
            success: false,
            error: 'Lỗi giải mã thông tin liên hệ.'
        };
    }
}

export async function toggleFavoriteAction(listingId: string) {
    const supabase = await createServerSupabaseClient();

    // 1. Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vui lòng đăng nhập để thực hiện.' };
    }

    try {
        // 2. Check if already favorited
        const { data: existing, error: checkError } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('listing_id', listingId)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
            // Remove from favorites
            const { error: deleteError } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('listing_id', listingId);

            if (deleteError) throw deleteError;

            revalidatePath(`/listings/${listingId}`);
            revalidatePath('/dashboard/favorites');
            return { success: true, isFavorite: false };
        } else {
            // Security measure: Prevent abuse by capping number of favorites per user
            const MAX_FAVORITES = 50;
            const { count, error: countError } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (countError) throw countError;

            if (count !== null && count >= MAX_FAVORITES) {
                return {
                    success: false,
                    error: `Bạn đã đạt giới hạn tối đa ${MAX_FAVORITES} tin đã lưu. Vui lòng bỏ lưu một số tin cũ trước khi lưu tin mới.`
                };
            }

            // Add to favorites
            const { error: insertError } = await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    listing_id: listingId,
                });

            if (insertError) throw insertError;

            revalidatePath(`/listings/${listingId}`);
            revalidatePath('/dashboard/favorites');
            return { success: true, isFavorite: true };
        }
    } catch (err: any) {
        console.error('Toggle favorite failed:', err);
        return {
            success: false,
            error: err.message || 'Đã xảy ra lỗi khi cập nhật danh sách yêu thích.'
        };
    }
}
