'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
    const user = await requireAuth()
    const supabase = createServiceRoleClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: admin only')
    }
    return user
}

// ─── Base Rate ────────────────────────────────────────────────────────────────

export async function updateBaseRate(prevState: unknown, formData: FormData) {
    try {
        const user = await requireAdmin()
        const supabase = createServiceRoleClient()

        const coinsRaw = formData.get('coins_per_1000vnd')
        const minRaw = formData.get('min_topup_vnd')

        const coins = parseInt(coinsRaw as string)
        const minVnd = parseInt(minRaw as string)

        if (!coins || coins < 1) return { success: false, error: 'Số xu phải >= 1' }
        if (!minVnd || minVnd < 1000) return { success: false, error: 'Số tiền tối thiểu phải >= 1.000 VNĐ' }

        const { error } = await supabase
            .from('coin_exchange_config')
            .update({ coins_per_1000vnd: coins, min_topup_vnd: minVnd, updated_at: new Date().toISOString(), updated_by: user.id })
            .eq('id', 1)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/coins')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message ?? 'Lỗi hệ thống' }
    }
}

// ─── Tiers ────────────────────────────────────────────────────────────────────

export async function createTier(prevState: unknown, formData: FormData) {
    try {
        await requireAdmin()
        const supabase = createServiceRoleClient()

        const label = (formData.get('label') as string)?.trim()
        const minVnd = parseInt(formData.get('min_amount_vnd') as string)
        const coins = parseInt(formData.get('coins_granted') as string)
        const order = parseInt(formData.get('display_order') as string) || 0

        if (!label) return { success: false, error: 'Tên gói không được để trống' }
        if (!minVnd || minVnd < 1000) return { success: false, error: 'Số tiền tối thiểu phải >= 1.000 VNĐ' }
        if (!coins || coins < 1) return { success: false, error: 'Số xu phải >= 1' }

        const { error } = await supabase.from('coin_topup_tiers').insert({
            label,
            min_amount_vnd: minVnd,
            coins_granted: coins,
            display_order: order,
            is_active: true,
        })

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/coins')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message ?? 'Lỗi hệ thống' }
    }
}

export async function updateTier(prevState: unknown, formData: FormData) {
    try {
        await requireAdmin()
        const supabase = createServiceRoleClient()

        const id = formData.get('id') as string
        const label = (formData.get('label') as string)?.trim()
        const minVnd = parseInt(formData.get('min_amount_vnd') as string)
        const coins = parseInt(formData.get('coins_granted') as string)
        const order = parseInt(formData.get('display_order') as string) || 0

        if (!id) return { success: false, error: 'Missing tier ID' }
        if (!label) return { success: false, error: 'Tên gói không được để trống' }
        if (!minVnd || minVnd < 1000) return { success: false, error: 'Số tiền tối thiểu phải >= 1.000 VNĐ' }
        if (!coins || coins < 1) return { success: false, error: 'Số xu phải >= 1' }

        const { error } = await supabase
            .from('coin_topup_tiers')
            .update({ label, min_amount_vnd: minVnd, coins_granted: coins, display_order: order })
            .eq('id', id)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/coins')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message ?? 'Lỗi hệ thống' }
    }
}

export async function deleteTier(id: string) {
    try {
        await requireAdmin()
        const supabase = createServiceRoleClient()

        const { error } = await supabase.from('coin_topup_tiers').delete().eq('id', id)
        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/coins')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message ?? 'Lỗi hệ thống' }
    }
}

export async function toggleTier(id: string, isActive: boolean) {
    try {
        await requireAdmin()
        const supabase = createServiceRoleClient()

        const { error } = await supabase
            .from('coin_topup_tiers')
            .update({ is_active: isActive })
            .eq('id', id)

        if (error) return { success: false, error: error.message }

        revalidatePath('/admin/coins')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message ?? 'Lỗi hệ thống' }
    }
}
