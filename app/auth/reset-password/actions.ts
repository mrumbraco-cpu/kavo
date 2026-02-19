'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { verifyCaptcha } from '@/lib/security/captcha'

export async function resetPasswordAction(formData: FormData) {
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

    const password = formData.get('password') as string

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        await logAuthEvent('password_reset', 'failure')
        return { error: error.message }
    }

    // Log success
    await logAuthEvent('password_reset', 'success', data.user?.id)

    return { success: true }
}
