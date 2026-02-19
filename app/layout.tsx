import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SPSHARE - Marketplace",
    description: "Connection-only marketplace",
};

import Script from "next/script";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning className="antialiased text-premium-900 bg-white">
                {children}
                {/* Global Turnstile script - loads once */}
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
