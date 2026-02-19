const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://*.cloudflare.com https://challenges.cloudflare.com https://cdn.jsdelivr.net https://*.google.com https://*.gstatic.com;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://*.cloudflare.com;
    img-src 'self' blob: data: https://*.cloudflare.com https://challenges.cloudflare.com https://raw.githubusercontent.com https://*.goong.io https://*.google.com https://*.gstatic.com;
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://pay-sandbox.sepay.vn https://pay.sepay.vn;
    frame-src 'self' https://*.cloudflare.com https://challenges.cloudflare.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cloudflare.com https://challenges.cloudflare.com https://pay-sandbox.sepay.vn https://pay.sepay.vn https://*.goong.io https://cdn.jsdelivr.net;
    worker-src 'self' blob: https://*.cloudflare.com https://challenges.cloudflare.com;
    child-src 'self' blob: https://*.cloudflare.com https://challenges.cloudflare.com;
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
