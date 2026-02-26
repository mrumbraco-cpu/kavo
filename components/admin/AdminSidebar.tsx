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
    Building2,
    Flag
} from 'lucide-react'
import { useState } from 'react'

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
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200 shadow-sm">
                <div className="flex flex-col flex-1 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ADMIN PANEL
                            </h1>
                            <p className="text-xs text-gray-500">SPSHARE</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {menuItems.map((item) => (
                            <div key={item.label}>
                                {item.submenu ? (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(undefined, item.submenu)
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50'
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
                                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.href)
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-3 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
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
