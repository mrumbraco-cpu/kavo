'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function updateReportStatus(reportId: string, status: 'resolved' | 'ignored') {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('listing_reports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reportId);

    if (error) {
        console.error('Update report status error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/reports');
    return { success: true };
}
