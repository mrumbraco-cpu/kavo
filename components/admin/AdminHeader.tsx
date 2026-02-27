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
    Coins,
    ShieldCheck
} from 'lucide-react'
import BrandLogo from '../public/BrandLogo'

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
            <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-premium-100/50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <Link href="/admin" className="flex items-center gap-2.5 transition-transform active:scale-95">
                        <BrandLogo scale={0.8} href={null} />
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 w-10 h-10 flex items-center justify-center rounded-xl bg-premium-900 text-white shadow-lg shadow-premium-900/10 hover:bg-premium-800 transition-all active:scale-90"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-premium-950/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu Panel */}
                    <div className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl animate-in slide-in-from-left duration-500 ease-out flex flex-col h-screen overflow-hidden">
                        {/* Header Section (Fixed Top) */}
                        <div className="flex-none">
                            {/* Logo & Close */}
                            <div className="flex items-center justify-between p-6 border-b border-premium-50 bg-premium-50/30">
                                <div className="space-y-3">
                                    <BrandLogo href="/admin" />
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-premium-900 rounded-lg w-fit">
                                        <ShieldCheck className="w-3 h-3 text-accent-gold" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Admin</span>
                                    </div>
                                    <p className="text-[10px] text-premium-400 font-bold uppercase tracking-wider truncate max-w-[200px]">{userEmail}</p>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-premium-100 transition-colors active:scale-90"
                                >
                                    <X className="w-5 h-5 text-premium-400" />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Section (Scrollable Middle) */}
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                            <p className="px-3 text-[10px] font-bold text-premium-300 uppercase tracking-widest mb-4">Quản lý hệ thống</p>
                            {menuItems.map((item) => (
                                <div key={item.label}>
                                    {item.submenu ? (
                                        <>
                                            <button
                                                onClick={() => toggleMenu(item.label)}
                                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${isActive(undefined, item.submenu)
                                                    ? 'bg-premium-900 text-white shadow-lg shadow-premium-900/10'
                                                    : 'text-premium-500 active:bg-premium-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={`w-5 h-5 ${isActive(undefined, item.submenu) ? 'text-accent-gold' : 'text-premium-400'}`} />
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
                                                                ? 'text-premium-900 font-bold'
                                                                : 'text-premium-400 active:bg-premium-50'
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
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${isActive(item.href)
                                                ? 'bg-premium-900 text-white shadow-lg shadow-premium-900/10'
                                                : 'text-premium-500 active:bg-premium-50'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-accent-gold' : 'text-premium-400'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Logout Section (Fixed Bottom) */}
                        <div className="flex-none p-5 border-t border-premium-50 bg-white">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all font-bold text-sm active:scale-[0.98]"
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
