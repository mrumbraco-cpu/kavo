'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Users,
    Wallet,
    CreditCard,
    Coins,
    Settings,
    LogOut,
    ChevronDown,
    PlusCircle,
    UserCircle,
    ShieldCheck,
    Flag
} from 'lucide-react'
import { useState } from 'react'
import BrandLogo from '../public/BrandLogo'

interface MenuItem {
    icon: React.ElementType
    label: string
    href?: string
    submenu?: {
        label: string
        href: string
    }[]
}

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['listings'])

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            })

            if (response.ok) {
                router.push('/auth/login')
                router.refresh()
                // Also trigger client-side refresh for all segments
                window.location.href = '/auth/login'
            }
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        )
    }

    const menuItems: MenuItem[] = [
        {
            icon: PlusCircle,
            label: 'Đăng tin',
            href: '/admin/listings/new',
        },
        {
            icon: FileText,
            label: 'Danh sách tin đăng',
            href: '/admin/listings',
        },
        {
            icon: Users,
            label: 'Quản lý người dùng',
            href: '/admin/users',
        },
        {
            icon: Wallet,
            label: 'Quản lý ví người dùng',
            href: '/admin/wallets',
        },
        {
            icon: CreditCard,
            label: 'Topup xu cho ví',
            href: '/admin/topup',
        },
        {
            icon: Coins,
            label: 'Cài đặt xu',
            href: '/admin/coins',
        },
        {
            icon: Flag,
            label: 'Báo cáo nội dung',
            href: '/admin/reports',
        },
        {
            icon: Settings,
            label: 'Cập nhật tài khoản',
            href: '/admin/profile',
        },
    ]

    const isActive = (href?: string, submenu?: { href: string }[]) => {
        if (href) {
            // Highlight 'Danh sách tin đăng' for edit and list views
            if (href === '/admin/listings') {
                return pathname === '/admin/listings' || (pathname.startsWith('/admin/listings/') && pathname.endsWith('/edit'))
            }
            return pathname === href
        }
        if (submenu) {
            return submenu.some(item => pathname === item.href)
        }
        return false
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-premium-100/50 shadow-sm">
                <div className="flex flex-col flex-1 overflow-y-auto">
                    {/* Logo Section */}
                    <div className="px-6 py-6 border-b border-premium-50">
                        <BrandLogo href="/admin" />
                        <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-premium-900 rounded-lg w-fit">
                            <ShieldCheck className="w-3 h-3 text-accent-gold" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Admin</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1.5">
                        {menuItems.map((item) => (
                            <div key={item.label}>
                                {item.submenu ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer group ${isActive(undefined, item.submenu)
                                                ? 'bg-premium-900 text-white shadow-lg shadow-premium-900/10'
                                                : 'text-premium-500 hover:bg-premium-50 hover:text-premium-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </div>
                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform ${expandedMenus.includes(item.label) ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                        {expandedMenus.includes(item.label) && (
                                            <div className="ml-8 mt-1 space-y-1">
                                                {item.submenu.map((subItem) => (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${pathname === subItem.href
                                                            ? 'text-premium-900 font-bold'
                                                            : 'text-premium-400 hover:text-premium-900'
                                                            }`}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href!}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive(item.href)
                                            ? 'bg-premium-900 text-white shadow-lg shadow-premium-900/10'
                                            : 'text-premium-500 hover:bg-premium-50 hover:text-premium-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 transition-colors ${isActive(item.href) ? 'text-accent-gold' : 'group-hover:text-premium-900'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-premium-50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
