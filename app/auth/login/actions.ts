'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { bootstrapProfile } from '@/lib/auth/bootstrapProfile'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { verifyCaptcha } from '@/lib/security/captcha'
import { logError } from '@/lib/utils/error-logger'

export async function loginAction(formData: FormData) {
    // 0. CAPTCHA Check
    const captchaToken = formData.get('captcha_token') as string
    const captchaResult = await verifyCaptcha(captchaToken)
    if (!captchaResult.success) {
        return { error: captchaResult.error }
    }

    // 1. Rate Limit Check
    const rateLimit = await checkAuthRateLimit('login')
    if (!rateLimit.allowed) {
        return { error: rateLimit.error }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        await logAuthEvent('login', 'failure')
        await logError('auth_login_error', error.message, { email }, null)
        return { error: error.message }
    }

    // Ensure profile exists
    await bootstrapProfile(supabase)

    // Log success
    await logAuthEvent('login', 'success', data.user?.id)

    return { success: true }
}
