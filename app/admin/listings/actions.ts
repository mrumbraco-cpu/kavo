'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function toggleExpired(id: string, currentStatus: string): Promise<boolean> {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const newStatus = currentStatus === 'expired' ? 'pending' : 'expired';

    const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        console.error('Error toggling expired:', error);
        return false;
    }

    revalidatePath('/admin/listings');
    revalidatePath('/listings/[slug]', 'page');
    return true;
}

export async function approveListing(id: string): Promise<boolean> {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('listings')
        .update({ status: 'approved' })
        .eq('id', id);

    if (error) {
        console.error('Error approving listing:', error);
        return false;
    }

    revalidatePath('/admin/listings');
    revalidatePath('/listings/[slug]', 'page');
    return true;
}

export async function toggleVisibility(id: string, currentIsHidden: boolean): Promise<boolean> {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('listings')
        .update({ is_hidden: !currentIsHidden })
        .eq('id', id);

    if (error) {
        console.error('Error toggling visibility:', error);
        return false;
    }

    revalidatePath('/admin/listings');
    revalidatePath('/listings/[slug]', 'page');
    return true;
}

export async function toggleLock(id: string, currentIsLocked: boolean): Promise<boolean> {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('listings')
        .update({ is_locked: !currentIsLocked })
        .eq('id', id);

    if (error) {
        console.error('Error toggling lock:', error);
        return false;
    }

    revalidatePath('/admin/listings');
    revalidatePath('/listings/[slug]', 'page');
    return true;
}
