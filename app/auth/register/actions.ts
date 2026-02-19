'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { bootstrapProfile } from '@/lib/auth/bootstrapProfile'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { verifyCaptcha } from '@/lib/security/captcha'

export async function registerAction(formData: FormData) {
    // 1. CAPTCHA Check
    const captchaToken = formData.get('captcha_token') as string
    const captchaResult = await verifyCaptcha(captchaToken)
    if (!captchaResult.success) {
        return { error: captchaResult.error }
    }

    // 2. Rate Limit Check
    const rateLimit = await checkAuthRateLimit('register')
    if (!rateLimit.allowed) {
        return { error: rateLimit.error }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        await logAuthEvent('register', 'failure')
        return { error: error.message }
    }

    // Log success
    await logAuthEvent('register', 'success', data.user?.id)

    // If session is established immediately (e.g. no email confirmation)
    if (data.session) {
        await bootstrapProfile(supabase)
        return { success: true, redirect: '/dashboard' }
    }

    return { success: true, message: 'Check your email to confirm registration' }
}

