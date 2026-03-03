import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap',
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        template: '%s | SPSHARE - Marketplace Kết Nối Không Gian',
        default: 'SPSHARE - Nền Tảng Chia Sẻ Không Gian Kinh Doanh Hàng Đầu',
    },
    description: 'Kết nối trực tiếp người có không gian dư thừa với người cần mặt bằng kinh doanh nhỏ. Workshop, sự kiện, kệ hàng, vỉa hè - Tối ưu chi phí, tăng giá trị.',
    metadataBase: new URL('https://spaceshare.vn'),
    keywords: ['chia sẻ không gian', 'thuê chỗ ngồi', 'workshop', 'mặt bằng nhỏ', 'kinh doanh', 'spaceshare'],
    authors: [{ name: 'SPSHARE Team' }],
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        url: 'https://spaceshare.vn',
        siteName: 'SPSHARE',
        title: 'SPSHARE - Marketplace Kết Nối Không Gian',
        description: 'Kết nối trực tiếp người có không gian dư thừa với người cần mặt bằng kinh doanh nhỏ.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'SPSHARE Marketplace',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SPSHARE - Marketplace Kết Nối Không Gian',
        description: 'Kết nối trực tiếp người có không gian dư thừa với người cần mặt bằng kinh doanh nhỏ.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <head>
                <link rel="preconnect" href="https://raw.githubusercontent.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
            </head>
            <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans antialiased text-premium-900 bg-white`}>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-premium-900 focus:text-white focus:rounded-lg">
                    Chuyển đến nội dung chính
                </a>
                <div id="main-content">
                    {children}
                </div>
            </body>
        </html>
    );
}
