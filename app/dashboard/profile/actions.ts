'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { profileSchema, passwordSchema } from '@/lib/validations/profile'

export async function updateProfile(formData: FormData) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Không tìm thấy người dùng' }

    const rawData = {
        phone: formData.get('phone') as string,
        zalo: formData.get('zalo') as string,
    }

    const validation = profileSchema.safeParse(rawData)
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    const { phone, zalo } = validation.data

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

    const rawData = {
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    }

    const validation = passwordSchema.safeParse(rawData)
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    const { password } = validation.data

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
