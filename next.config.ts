const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://raw.githubusercontent.com https://challenges.cloudflare.com https://*.goong.io;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://pay-sandbox.sepay.vn https://pay.sepay.vn;
    frame-src 'self' https://challenges.cloudflare.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://pay-sandbox.sepay.vn https://pay.sepay.vn https://*.goong.io;
    worker-src 'self' blob:;
    child-src 'self' blob:;
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader,
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            allowedOrigins: [
                'localhost:3000',
                '*.ngrok-free.app',
                '*.ngrok.io'
            ],
        },
    },
};

export default nextConfig;
