'use client'

import React, { useEffect, useRef } from 'react'

interface TurnstileProps {
    onVerify: (token: string) => void
    onExpire?: () => void
    onError?: () => void
    theme?: 'light' | 'dark' | 'auto'
}

declare global {
    interface Window {
        turnstile: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string
                    callback: (token: string) => void
                    'expired-callback'?: () => void
                    'error-callback'?: () => void
                    theme?: 'light' | 'dark' | 'auto'
                }
            ) => string
            reset: (widgetId: string) => void
            remove: (widgetId: string) => void
        }
    }
}

export default function Turnstile({ onVerify, onExpire, onError, theme = 'auto' }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    const isLocalDev = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '::1' ||
            window.location.hostname.startsWith('192.168.') ||
            window.location.hostname.startsWith('10.') ||
            window.location.hostname.startsWith('172.'));

    // ALWAYS use testing key on local development hostnames to avoid domain mismatch
    // Unless we are NOT on local, then use the provided site key
    const activeSiteKey = isLocalDev ? '1x00000000000000000000AA' : (siteKey || '');

    const onVerifyRef = useRef(onVerify)
    const onExpireRef = useRef(onExpire)
    const onErrorRef = useRef(onError)

    // Update refs when props change
    useEffect(() => { onVerifyRef.current = onVerify }, [onVerify])
    useEffect(() => { onExpireRef.current = onExpire }, [onExpire])
    useEffect(() => { onErrorRef.current = onError }, [onError])

    useEffect(() => {
        if (!activeSiteKey) return

        let isMounted = true
        let retryCount = 0
        const maxRetries = 10

        const renderTurnstile = () => {
            if (window.turnstile && containerRef.current && !widgetIdRef.current && isMounted) {
                try {
                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: activeSiteKey,
                        callback: (token: string) => onVerifyRef.current(token),
                        'expired-callback': () => onExpireRef.current?.(),
                        'error-callback': () => onErrorRef.current?.(),
                        theme: theme,
                    })
                } catch (err) {
                    console.error('Turnstile render error:', err)
                }
            } else if (!window.turnstile && retryCount < maxRetries && isMounted) {
                // Retry if script not yet loaded
                retryCount++
                setTimeout(renderTurnstile, 500)
            }
        }

        renderTurnstile()

        return () => {
            isMounted = false
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current)
                } catch (err) {
                    // Ignore errors during cleanup
                }
                widgetIdRef.current = null
            }
        }
    }, [activeSiteKey, theme])

    if (!activeSiteKey) return null

    return (
        <div className="flex justify-center my-4 min-h-[65px]">
            <div ref={containerRef} />
        </div>
    )
}
