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
