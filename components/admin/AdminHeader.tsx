'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Menu,
    X,
    PlusCircle,
    FileText,
    Users,
    Wallet,
    CreditCard,
    Settings,
    LogOut,
    ChevronDown,
    Building2,
    Coins
} from 'lucide-react'

interface AdminHeaderProps {
    userEmail: string
    coinBalance: number
}

interface MenuItem {
    icon: React.ElementType
    label: string
    href?: string
    submenu?: {
        label: string
        href: string
    }[]
}

export default function AdminHeader({ userEmail, coinBalance }: AdminHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['listings'])
    const pathname = usePathname()
    const router = useRouter()

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
            icon: Settings,
            label: 'Cập nhật tài khoản',
            href: '/admin/profile',
        },
    ]

    const isActive = (href?: string, submenu?: { href: string }[]) => {
        if (href) {
            return pathname === href
        }
        if (submenu) {
            return submenu.some(item => pathname === item.href)
        }
        return false
    }

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <Link href="/admin" className="flex items-center gap-2.5 transition-transform active:scale-95">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                            ADMIN PANEL
                        </span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors active:scale-90"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5 text-gray-700" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-700" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu Panel */}
                    <div className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl animate-in slide-in-from-left duration-500 ease-out flex flex-col h-screen overflow-hidden">
                        {/* Header Section (Fixed Top) */}
                        <div className="flex-none">
                            {/* Logo & Close */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-lg font-bold text-gray-900 block leading-none">ADMIN</span>
                                        <p className="text-[10px] text-gray-500 font-medium mt-1 truncate max-w-[150px]">{userEmail}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors active:scale-90"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Section (Scrollable Middle) */}
                        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quản lý hệ thống</p>
                            {menuItems.map((item) => (
                                <div key={item.label}>
                                    {item.submenu ? (
                                        <>
                                            <button
                                                onClick={() => toggleMenu(item.label)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(undefined, item.submenu)
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 active:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`w-5 h-5 ${isActive(undefined, item.submenu) ? 'text-blue-600' : 'text-gray-400'}`} />
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
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className={`block px-3 py-2 rounded-lg text-sm transition-all ${pathname === subItem.href
                                                                ? 'bg-blue-100/50 text-blue-700 font-bold'
                                                                : 'text-gray-600 active:bg-gray-50'
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
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.href)
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 active:bg-gray-50'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Logout Section (Fixed Bottom) */}
                        <div className="flex-none p-4 border-t border-gray-100 bg-white">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all font-medium text-sm active:scale-[0.98]"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
