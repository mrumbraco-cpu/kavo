'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { LockStatus } from '@/types/profile'
import { requireAdmin } from '@/lib/auth/requireAdmin'

interface LockUserParams {
    userId: string
    status: LockStatus
}

type LockResult =
    | { success: true; message: string }
    | { success: false; error: string }

export async function updateUserLockStatus({ userId, status }: LockUserParams): Promise<LockResult> {
    try {
        // MANDATORY ROLE GUARD
        await requireAdmin();

        // Use Service Role Client for operations
        const adminClient = createServiceRoleClient()

        // 1. Update profiles table
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({
                lock_status: status,
                lock_updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (profileError) {
            console.error('Profile lock update error:', profileError)
            return { success: false, error: 'Lỗi khi cập nhật trạng thái khóa người dùng' }
        }

        // 2. Handle Hard Lock in Supabase Auth
        // Hard lock means banning the user so they are kicked out and can't login
        if (status === 'hard') {
            // Ban the user
            const { error: banError } = await adminClient.auth.admin.updateUserById(
                userId,
                { ban_duration: '876000h' } // 100 years
            )
            if (banError) {
                console.error('Auth ban error:', banError)
                return { success: false, error: 'Đã cập nhật profile nhưng lỗi khi cấm đăng nhập' }
            }
        } else {
            // Unban if it was hard locked before
            const { error: unbanError } = await adminClient.auth.admin.updateUserById(
                userId,
                { ban_duration: 'none' }
            )
            if (unbanError) {
                console.error('Auth unban error:', unbanError)
                // We don't return error here if the user wasn't previously banned, 
                // but usually it's better to log it.
            }
        }

        revalidatePath('/admin/users')

        let message = ''
        switch (status) {
            case 'none': message = 'Đã mở khóa người dùng'; break;
            case 'soft': message = 'Đã khóa mềm người dùng (chỉ chặn đăng/sửa bài)'; break;
            case 'hard': message = 'Đã khóa cứng người dùng (đăng xuất và chặn đăng nhập)'; break;
        }

        return { success: true, message }
    } catch (error) {
        console.error('Lock user error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
