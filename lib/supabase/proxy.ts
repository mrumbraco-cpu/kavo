import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser().
    const { data: { user } } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/api') &&
        request.nextUrl.pathname !== '/' &&
        request.nextUrl.pathname !== '/search' &&
        !request.nextUrl.pathname.startsWith('/listings')
    ) {
        if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) {
            const host = request.headers.get('host') || request.nextUrl.host
            const protocol = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.replace(':', '')) || 'http'
            const redirectUrl = `${protocol}://${host}/auth/login?next=${encodeURIComponent(request.nextUrl.pathname)}`
            console.log(`[Proxy] Auth required. Redirecting to: ${redirectUrl}`)
            return NextResponse.redirect(redirectUrl)
        }
    }

    return supabaseResponse
}
