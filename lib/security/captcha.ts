export async function verifyCaptcha(token: string): Promise<{ success: boolean; error?: string }> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.warn('TURNSTILE_SECRET_KEY is not set. Skipping CAPTCHA verification (unsafe).');
        return { success: true };
    }

    if (!token) {
        return { success: false, error: 'Vui lòng xác thực CAPTCHA.' };
    }

    try {
        // We try the test secret key as a fallback for local IP development.
        const secretsToTry = [secretKey, '1x000000000000000000000000000000000'];

        for (const skey of secretsToTry) {
            const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=${encodeURIComponent(skey)}&response=${encodeURIComponent(token)}`,
            });

            const data = await response.json();

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
