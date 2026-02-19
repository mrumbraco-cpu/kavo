'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/requireAdmin';

interface TopupUserCoinsParams {
    userId: string
    amount: number
    note?: string
}

type TopupResult =
    | { success: true; message: string }
    | { success: false; error: string }

export async function topupUserCoins({ userId, amount, note }: TopupUserCoinsParams): Promise<TopupResult> {
    try {
        // MANDATORY ROLE GUARD
        await requireAdmin();

        // Use Service Role Client for operations on other users
        const adminClient = createServiceRoleClient()

        // Get current user balance
        const { data: targetUser, error: fetchError } = await adminClient
            .from('profiles')
            .select('coin_balance, email')
            .eq('id', userId)
            .single()

        if (fetchError || !targetUser) {
            return { success: false, error: 'User not found' }
        }

        const currentBalance = targetUser.coin_balance || 0
        const newBalance = currentBalance + amount

        // Prevent negative balance
        if (newBalance < 0) {
            return { success: false, error: 'Số dư không đủ để thực hiện giao dịch này' }
        }

        // Update user balance
        const { error: updateError } = await adminClient
            .from('profiles')
            .update({ coin_balance: newBalance })
            .eq('id', userId)

        if (updateError) {
            return { success: false, error: 'Failed to update balance' }
        }

        // Create transaction record
        const { error: transactionError } = await adminClient
            .from('coin_transactions')
            .insert({
                user_id: userId,
                type: 'admin_adjustment',
                amount: amount,
                balance_after: newBalance,
                metadata: note ? { note } : null,
            })

        if (transactionError) {
            console.error('Failed to create transaction record:', transactionError)
        }

        revalidatePath('/admin/topup')
        revalidatePath('/admin/wallets')

        return {
            success: true,
            message: `Đã ${amount > 0 ? 'nạp' : 'trừ'} ${Math.abs(amount).toLocaleString('vi-VN')} xu cho ${targetUser.email}. Số dư mới: ${newBalance.toLocaleString('vi-VN')} xu`,
        }
    } catch (error) {
        console.error('Topup error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
