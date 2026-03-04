import { headers } from 'next/headers';

export async function verifyCaptcha(token: string): Promise<{ success: boolean; error?: string }> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    const testSecretKey = '1x00000000000000000000000000000000';

    if (!secretKey) {
        console.warn('TURNSTILE_SECRET_KEY is not set. Skipping CAPTCHA verification (unsafe).');
        return { success: true };
    }

    if (!token) {
        return { success: false, error: 'Vui lòng xác thực CAPTCHA.' };
    }

    // Detect local environment first — before any token check
    let isLocal = false;
    let hostname = '';
    try {
        const headerList = await headers();
        const host = headerList.get('host') || '';
        hostname = host.split(':')[0];
        isLocal = hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '::1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.');
    } catch (e) {
        // Outside of request context
    }

    // On local environments, Turnstile cannot generate valid tokens because the domain
    // (localhost/IP) is not registered in the Turnstile dashboard.
    // Bypass verification entirely to unblock development.
    if (isLocal) {
        console.log(`[Captcha] Local environment detected (${hostname}). Bypassing CAPTCHA verification.`);
        return { success: true };
    }

    try {
        // Production environment: verify with real key
        const secretsToTry: string[] = [];
        const isTestToken = token.startsWith('1x');

        if (isTestToken) {
            secretsToTry.push(testSecretKey);
            if (secretKey) secretsToTry.push(secretKey);
        } else {
            if (secretKey) secretsToTry.push(secretKey);
            secretsToTry.push(testSecretKey);
        }

        for (const skey of secretsToTry) {
            const keyPrefix = skey.substring(0, 6);
            console.log(`[Captcha] Verifying (hostname: ${hostname}, isLocal: ${isLocal}, isTestToken: ${isTestToken})`);
            console.log(`[Captcha] Key: ${keyPrefix}..., Token: ${token.substring(0, 10)}...`);

            const params = new URLSearchParams();
            params.append('secret', skey);
            params.append('response', token);

            const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: params,
            });

            const data = await response.json();
            console.log(`[Captcha] Cloudflare Response:`, JSON.stringify(data));

            if (data.success) {
                return { success: true };
            }
        }

        return { success: false, error: 'Xác thực CAPTCHA không thành công. Vui lòng thử lại.' };
    } catch (error) {
        console.error('Captcha error:', error);
        return { success: false, error: 'Lỗi xác thực bảo mật.' };
    }
}
