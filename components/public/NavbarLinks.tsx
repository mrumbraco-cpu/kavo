'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
    user: any;
}

export default function NavbarLinks({ user }: Props) {
    const pathname = usePathname();
    const isSearchPage = pathname === '/search';

    return (
        <nav className="hidden xl:flex items-center gap-6">
            {!isSearchPage && (
                <Link
                    href="/search"
                    className="text-sm font-medium text-premium-600 hover:text-premium-900 transition-colors"
                >
                    Khám phá
                </Link>
            )}

        </nav>
    );
}
