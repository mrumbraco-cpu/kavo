'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/utils/encryption';
import { revalidatePath } from 'next/cache';
import { REPORT_REASONS } from '@/lib/constants/report-reasons';

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
        revalidatePath('/listings/[slug]', 'page');

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

            revalidatePath('/listings/[slug]', 'page');
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

            revalidatePath('/listings/[slug]', 'page');
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

export async function submitReportAction(listingId: string, reason: string, description?: string) {
    const supabase = await createServerSupabaseClient();

    // 1. Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Vui lòng đăng nhập để báo cáo.' };
    }

    // 1b. Validate reason
    const isValidReason = REPORT_REASONS.some(r => r.value === reason);
    if (!isValidReason) {
        return { success: false, error: 'Lý do báo cáo không hợp lệ.' };
    }

    try {
        // 2. Time-based rate limit: 1 report every 2 minutes
        const { data: lastReport } = await supabase
            .from('listing_reports')
            .select('created_at')
            .eq('reporter_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastReport) {
            const lastTime = new Date(lastReport.created_at).getTime();
            const now = new Date().getTime();
            const diffMinutes = (now - lastTime) / (1000 * 60);

            if (diffMinutes < 2) {
                return {
                    success: false,
                    error: `Vui lòng đợi ${Math.ceil(2 - diffMinutes)} phút nữa trước khi gửi báo cáo tiếp theo.`
                };
            }
        }

        // 3. Anti-spam check: prevent reporting same listing twice while one is pending
        const { data: existingReport } = await supabase
            .from('listing_reports')
            .select('id')
            .eq('listing_id', listingId)
            .eq('reporter_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

        if (existingReport) {
            return { success: false, error: 'Bạn đã báo cáo tin này và đang chờ xử lý.' };
        }

        // 4. Overall rate limit: max 5 pending reports per user
        const { count } = await supabase
            .from('listing_reports')
            .select('id', { count: 'exact', head: true })
            .eq('reporter_id', user.id)
            .eq('status', 'pending');

        if (count !== null && count >= 5) {
            return { success: false, error: 'Bạn đã gửi quá nhiều báo cáo đang chờ xử lý. Vui lòng đợi kết quả từ quản trị viên.' };
        }

        // 5. Insert report
        const { error } = await supabase
            .from('listing_reports')
            .insert({
                listing_id: listingId,
                reporter_id: user.id,
                reason,
                description: description?.trim().slice(0, 1000)
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return { success: false, error: 'Bạn đã báo cáo tin này và đang chờ xử lý.' };
            }
            throw error;
        }

        return { success: true };
    } catch (err: any) {
        console.error('Submit report failed:', err);
        return { success: false, error: 'Đã xảy ra lỗi khi gửi báo cáo.' };
    }
}

