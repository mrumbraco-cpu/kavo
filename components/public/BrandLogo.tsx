'use client';

import Link from 'next/link';

interface BrandLogoProps {
    className?: string;
    iconOnly?: boolean;
    dark?: boolean;
    href?: string | null;
    scale?: number;
}

export default function BrandLogo({
    className = '',
    iconOnly = false,
    dark = false,
    href = '/',
    scale = 1
}: BrandLogoProps) {
    const Component = href ? Link : 'div';
    const componentProps = href ? { href } : {};

    const content = (
        <div className={`flex items-center gap-2.5 group ${className}`} style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'left center' }}>
            <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 ${dark ? 'bg-white text-premium-900' : 'bg-premium-900 text-white shadow-md shadow-premium-900/10'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                    />
                </svg>
            </div>
            {!iconOnly && (
                <span className={`text-xl font-bold tracking-tight transition-colors duration-200 ${dark ? 'text-white' : 'text-premium-900 group-hover:text-premium-700'}`}>
                    Space<span className={dark ? 'text-white/80' : 'text-accent-gold'}>Share</span>
                </span>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="contents">
                {content}
            </Link>
        );
    }

    return content;
}
