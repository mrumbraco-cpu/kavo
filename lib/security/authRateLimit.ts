import { createServiceRoleClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

type AuthEvent = 'login' | 'register' | 'password_reset';

export async function checkAuthRateLimit(event: AuthEvent): Promise<{ allowed: boolean; error?: string }> {
    const headerList = await headers();
    // Get client IP - Note: In a real prod env, verify which header your proxy/Next.js uses
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    const supabase = createServiceRoleClient();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Rate limits per Hour per IP
    const limits: Record<AuthEvent, number> = {
        'register': 5,
        'login': 20,
        'password_reset': 3
    };

    const { count, error } = await supabase
        .from('auth_logs')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .eq('event_type', event)
        .gte('created_at', oneHourAgo);

    if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: true }; // Allow if DB check fails to not block users, but log it
    }

    if (count !== null && count >= limits[event]) {
        return {
            allowed: false,
            error: 'Bạn đã thực hiện thao tác này quá nhiều lần. Vui lòng thử lại sau 1 giờ.'
        };
    }

    return { allowed: true };
}

export async function logAuthEvent(event: AuthEvent, status: 'success' | 'failure', userId?: string) {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    const supabase = createServiceRoleClient();

    await supabase.from('auth_logs').insert({
        user_id: userId,
        ip_address: ip,
        event_type: event,
        status: status
    });
}
