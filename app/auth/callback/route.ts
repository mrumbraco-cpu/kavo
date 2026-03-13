import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { bootstrapProfile } from '@/lib/auth/bootstrapProfile'
import { checkAuthRateLimit, logAuthEvent } from '@/lib/security/authRateLimit'
import { logError } from '@/lib/utils/error-logger'
import { translateAuthMessage } from '@/lib/utils/auth-translations'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)

    const code = requestUrl.searchParams.get('code')
    const tokenHash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const nextParam = requestUrl.searchParams.get('next')
    const nextPath = nextParam && nextParam.startsWith('/') && nextParam !== '/' ? nextParam : '/dashboard'

    // In Next.js dev mode, request.url may resolve to localhost even when
    // the browser accessed the app via a local network IP (e.g. 192.168.x.x).
    // We read the actual Host header to construct the correct redirect origin
    // so the user is sent back to the host they came from.
    const hostHeader = request.headers.get('host') // e.g. "192.168.1.5:3000" or "localhost:3000"
    const protocol = request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', '')
    const origin = hostHeader
        ? `${protocol}://${hostHeader}`
        : requestUrl.origin

    if (tokenHash && type) {
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
        })

        if (!error) {
            return NextResponse.redirect(`${origin}${nextPath}`)
        }

        await logError('auth_callback_otp_error', error.message, { tokenHash, type, nextPath }, null)
        
        const isResetPassword = nextPath.includes('reset-password')
        if (isResetPassword) {
            return NextResponse.redirect(
                `${origin}/auth/forgot-password?error=${encodeURIComponent('Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.')}`
            )
        }
    }

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
                `${origin}/auth/login?error=${encodeURIComponent(translateAuthMessage(rateLimit.error) || 'Quá nhiều lượt thử đăng nhập')}`
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
                    `${origin}/auth/login?error=account_hard_locked`
                )
            }

            return NextResponse.redirect(`${origin}${nextPath}`)
        }

        // --- PKCE Resilience Logic ---
        // If the error is related to PKCE (verifier not found), it means the link
        // was opened in a different browser/session or the cookie was lost.
        if (error.message.includes('code verifier') || error.message.includes('PKCE')) {
            const isResetPassword = nextPath.includes('reset-password')
            
            if (isResetPassword) {
                // Since we now support token_hash, a PKCE failure usually means
                // the user is using an old confirmation link.
                return NextResponse.redirect(
                    `${origin}/auth/forgot-password?message=${encodeURIComponent('Để bảo mật, vui lòng nhập lại email bên dưới để nhận liên kết mới.')}`
                )
            }

            return NextResponse.redirect(
                `${origin}/auth/login?message=${encodeURIComponent('Email đã được xác thực thành công. Vui lòng đăng nhập để bắt đầu.')}`
            )
        }

        // Log failed login attempt for other errors
        await logAuthEvent('login', 'failure')
        await logError('auth_callback_error', error.message, { code, nextPath }, null)

        // If it's a reset password attempt that failed for other reasons, still prefer forgot-password page
        if (nextPath.includes('reset-password')) {
            return NextResponse.redirect(
                `${origin}/auth/forgot-password?error=${encodeURIComponent(translateAuthMessage(error.message))}`
            )
        }

        return NextResponse.redirect(
            `${origin}/auth/login?error=${encodeURIComponent(translateAuthMessage(error.message))}`
        )
    }

    // Check if there are error query parameters sent by Supabase 
    // (This happens BEFORE code exchange if Supabase detects an issue like expired token)
    const errorDescription = requestUrl.searchParams.get('error_description')
    const errorCode = requestUrl.searchParams.get('error_code')

    if (errorDescription || errorCode) {
        await logError('auth_callback_provider_error', errorDescription || errorCode, { searchParams: Object.fromEntries(requestUrl.searchParams.entries()) }, null)
        
        const isResetPassword = nextPath.includes('reset-password')
        const translatedError = translateAuthMessage(errorDescription || errorCode)

        if (isResetPassword) {
            // Improve message for expired/invalid reset links
            let customMessage = translatedError
            if (errorCode === 'otp_expired' || (errorDescription && errorDescription.includes('expired'))) {
                customMessage = 'Liên kết đã hết hạn hoặc đã được sử dụng. Vui lòng nhập lại email bên dưới để nhận liên kết mới.'
            }
            
            return NextResponse.redirect(
                `${origin}/auth/forgot-password?error=${encodeURIComponent(customMessage)}`
            )
        }

        return NextResponse.redirect(
            `${origin}/auth/login?error=${encodeURIComponent(translatedError)}`
        )
    }

    return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent('Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.')}`
    )
}
