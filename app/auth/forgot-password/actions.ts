'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { verifyCaptcha } from '@/lib/security/captcha'
import { logError } from '@/lib/utils/error-logger'

import { headers } from 'next/headers'

export async function forgotPasswordAction(formData: FormData) {
    // 0. CAPTCHA Check
    const captchaToken = formData.get('captcha_token') as string
    const captchaResult = await verifyCaptcha(captchaToken)
    if (!captchaResult.success) {
        return { error: captchaResult.error }
    }

    // 1. Rate Limit Check
    const rateLimit = await checkAuthRateLimit('password_reset')
    if (!rateLimit.allowed) {
        return { error: rateLimit.error }
    }

    const email = formData.get('email') as string

    // Dynamically determine the origin from request headers
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
    const origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'https://choban.vn')

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
    })

    if (error) {
        await logAuthEvent('password_reset', 'failure')
        await logError('auth_forgot_password_error', error.message, { email }, null)
        return { error: error.message }
    }

    // Log success
    await logAuthEvent('password_reset', 'success')

    return { success: true, message: 'Đã gửi liên kết đặt lại mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).' }
}
