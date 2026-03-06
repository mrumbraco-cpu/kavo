import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { bootstrapProfile } from '@/lib/auth/bootstrapProfile'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { logError } from '@/lib/utils/error-logger'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const host = request.headers.get('host') || requestUrl.host
    const protocol = request.headers.get('x-forwarded-proto') || (requestUrl.protocol.replace(':', '')) || 'http'
    const currentOrigin = `${protocol}://${host}`

    console.log(`>>> [AUTH CALLBACK] Protocol: ${protocol} | Host: ${host} | Origin: ${currentOrigin}`)
    console.log(`>>> [AUTH CALLBACK] Full Request URL: ${request.url}`)

    const code = requestUrl.searchParams.get('code')
    const nextParam = requestUrl.searchParams.get('next')
    const nextPath = nextParam && nextParam.startsWith('/') && nextParam !== '/' ? nextParam : '/dashboard'
    const finalRedirectUrl = `${currentOrigin}${nextPath}`

    if (code) {
        const supabase = await createServerSupabaseClient()

        // --- IDENTITY SWITCH PROTECTION ---
        // If we are processing a new auth code, we MUST clear any existing session
        // in this browser to prevent session mixing (e.g. clicking a link for 
        // User B while User A is logged in).
        const { data: { session: existingSession } } = await supabase.auth.getSession()
        if (existingSession) {
            await supabase.auth.signOut()
            // Regenerate supabase client after signout for the code exchange
        }

        // Check rate limit before exchanging code
        const rateLimit = await checkAuthRateLimit('login')
        if (!rateLimit.allowed) {
            return NextResponse.redirect(
                `${currentOrigin}/auth/login?error=${encodeURIComponent(rateLimit.error || 'Too many login attempts')}`
            )
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            const profile = await bootstrapProfile(supabase)

            // Log successful login
            await logAuthEvent('login', 'success', user?.id)

            if (profile?.lock_status === 'hard') {
                await supabase.auth.signOut()
                return NextResponse.redirect(
                    `${currentOrigin}/auth/login?error=account_hard_locked`
                )
            }

            console.log(`>>> [AUTH CALLBACK] Success! Redirecting to: ${finalRedirectUrl}`)
            return NextResponse.redirect(finalRedirectUrl)
        }

        // --- PKCE Resilience Logic ---
        // If the error is related to PKCE (verifier not found), it means the link
        // was opened in a different browser. At this point, the email IS confirmed
        // but we couldn't create a session.
        if (error.message.includes('code verifier') || error.message.includes('PKCE')) {
            return NextResponse.redirect(
                `${currentOrigin}/auth/login?message=${encodeURIComponent('Email đã được xác thực thành công. Vui lòng đăng nhập để bắt đầu.')}`
            )
        }

        // Log failed login attempt for other errors
        await logAuthEvent('login', 'failure')
        await logError('auth_callback_error', error.message, { code, nextPath }, null)

        const errorUrl = `${currentOrigin}/auth/login?error=${encodeURIComponent(error.message)}`
        console.log(`>>> [AUTH CALLBACK] Error! Redirecting to: ${errorUrl}`)
        return NextResponse.redirect(errorUrl)
    }

    // Check if there are error query parameters sent by Supabase
    const errorDescription = requestUrl.searchParams.get('error_description')
    if (errorDescription) {
        await logError('auth_callback_provider_error', errorDescription, { searchParams: Object.fromEntries(requestUrl.searchParams.entries()) }, null)
        return NextResponse.redirect(
            `${currentOrigin}/auth/login?error=${encodeURIComponent(errorDescription)}`
        )
    }

    return NextResponse.redirect(
        `${currentOrigin}/auth/login?error=Link+expired+or+already+used.+Please+try+signing+up+again.`
    )
}
