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
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
        });

        const data = await response.json();

        if (data.success) {
            return { success: true };
        } else {
            console.error('Turnstile verification failed:', data['error-codes']);
            return { success: false, error: 'Xác thực CAPTCHA không thành công. Vui lòng thử lại.' };
        }
    } catch (error) {
        console.error('Captcha error:', error);
        return { success: false, error: 'Lỗi xác thực bảo mật.' };
    }
}
