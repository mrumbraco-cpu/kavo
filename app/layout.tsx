import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ['400', '500', '600', '700'],
});

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
        <html lang="vi">
            <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans antialiased text-premium-900 bg-white`}>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-premium-900 focus:text-white focus:rounded-lg">
                    Chuyển đến nội dung chính
                </a>
                <div id="main-content">
                    {children}
                </div>
                {/* Global Turnstile script - loads once */}
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
