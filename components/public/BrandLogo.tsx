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
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Mảnh ghép 1 - Đại diện cho F1 (Chủ nhà) */}
                    <path
                        d="M 20 4 L 4 14 L 8 14 L 8 30 A 4 4 0 0 0 12 34 L 20 34 L 20 23 A 4 4 0 0 0 20 15 L 20 4 Z"
                        fill={dark ? "#ffffff" : "#2563eb"}
                        className="transition-transform duration-500 ease-out group-hover:-translate-x-1 origin-right"
                    />
                    {/* Mảnh ghép 2 - Đại diện cho F2 (Người kinh doanh) - Lồng vào mảnh 1 */}
                    <path
                        d="M 20 4 L 20 15 A 4 4 0 0 1 20 23 L 20 34 L 28 34 A 4 4 0 0 0 32 30 L 32 14 L 36 14 L 20 4 Z"
                        fill={"#d4af37"}
                        className="transition-transform duration-500 ease-out group-hover:translate-x-1 origin-left"
                    />
                </svg>
            </div>
            {!iconOnly && (
                <span className={`text-xl font-bold tracking-tight transition-colors duration-200 ${dark ? 'text-white' : 'text-premium-900 group-hover:text-premium-700'}`}>
                    CHOBAN<span className={dark ? 'text-white/80' : 'text-accent-gold'}>.VN</span>
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
