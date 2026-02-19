'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'

export async function updateProfile(formData: FormData) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Không tìm thấy người dùng' }

    const phone = formData.get('phone') as string
    const zalo = formData.get('zalo') as string

    // Update public.profiles table
    const { error } = await supabase
        .from('profiles')
        .update({
            phone,
            zalo,
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/profile')
    return { success: true, message: 'Cập nhật thông tin thành công' }
}

export async function updatePassword(formData: FormData) {
    // 1. Rate Limit Check
    const rateLimit = await checkAuthRateLimit('password_reset')
    if (!rateLimit.allowed) {
        return { error: rateLimit.error }
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Không tìm thấy người dùng' }
    }

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return { error: 'Mật khẩu xác nhận không khớp' }
    }

    if (password.length < 6) {
        return { error: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        await logAuthEvent('password_reset', 'failure', user.id)
        return { error: error.message }
    }

    // Log success
    await logAuthEvent('password_reset', 'success', user.id)

    return { success: true, message: 'Đổi mật khẩu thành công' }
}
