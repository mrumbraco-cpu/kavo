'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { bootstrapProfile } from '@/lib/auth/bootstrapProfile'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { verifyCaptcha } from '@/lib/security/captcha'
import { logError } from '@/lib/utils/error-logger'
import { translateAuthMessage } from '@/lib/utils/auth-translations'


import { headers } from 'next/headers'

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

    // Dynamically determine the origin from request headers
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
    const origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'https://choban.vn')

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        await logAuthEvent('register', 'failure')
        await logError('auth_register_error', error.message, { email }, null)
        return { error: translateAuthMessage(error.message) }
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

