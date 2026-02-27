'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Menu,
    X,
    PlusCircle,
    FileText,
    Heart,
    Settings,
    LogOut,
    Coins,
    Home,
    Unlock
} from 'lucide-react'
import { formatCompactPrice } from '@/lib/utils/format'

interface DashboardHeaderProps {
    userEmail: string
    coinBalance: number
}

export default function DashboardHeader({ userEmail, coinBalance }: DashboardHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

    const menuItems = [
        {
            icon: Coins,
            label: 'Tài khoản xu',
            href: '/dashboard/coins',
            badge: `${formatCompactPrice(coinBalance)} xu`,
            badgeColor: 'bg-yellow-100 text-yellow-800'
        },
        {
            icon: FileText,
            label: 'Danh sách tin đăng',
            href: '/dashboard/listings',
        },
        {
            icon: Heart,
            label: 'Tin đã lưu',
            href: '/dashboard/favorites',
        },
        {
            icon: Unlock,
            label: 'Khóa liên hệ đã mở',
            href: '/dashboard/unlocked-listings',
        },
        {
            icon: Settings,
            label: 'Cập nhật tài khoản',
            href: '/dashboard/profile',
        },
    ]

    const isActive = (href: string) => {
        if (href === '/dashboard/listings/new') {
            return pathname === href
        }
        if (href === '/dashboard/listings') {
            return pathname.startsWith(href) && pathname !== '/dashboard/listings/new'
        }
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 transition-transform active:scale-95">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-black text-sm italic tracking-tighter">SP</span>
                        </div>
                        <span className="text-base font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            SPSHARE
                        </span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                        aria-expanded={isMobileMenuOpen}
                        className="p-2 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors active:scale-90"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5 text-gray-700" aria-hidden="true" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-700" aria-hidden="true" />
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
                    <div className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col h-screen overflow-hidden">
                        {/* Header Section (Fixed Top) */}
                        <div className="flex-none">
                            {/* Logo & Close */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                        <span className="text-white font-black text-lg italic tracking-tighter">SP</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">SPSHARE</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-label="Đóng menu"
                                    className="p-2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors active:scale-90"
                                >
                                    <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                </button>
                            </div>

                            {/* User Info & Action Button */}
                            <div className="p-4 space-y-4 border-b border-gray-50">
                                <div className="px-1 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm">
                                        {userEmail.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {userEmail.split('@')[0]}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Thành viên</p>
                                        </div>
                                    </div>
                                </div>

                                {/* New Listing Action Button */}
                                <Link
                                    href="/dashboard/listings/new"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-3 p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center border border-white/20">
                                        <PlusCircle className="w-5 h-5 text-white" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm font-black text-white uppercase tracking-wider">Đăng tin mới</span>
                                </Link>
                            </div>
                        </div>

                        {/* Navigation Section (Scrollable Middle) */}
                        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quản lý</p>
                            {menuItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 active:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} aria-hidden="true" />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.badge && !active && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                {item.badge.split(' ')[0]}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout Section (Fixed Bottom) */}
                        <div className="flex-none p-4 border-t border-gray-100 bg-white">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all font-medium text-sm active:scale-[0.98]"
                            >
                                <LogOut className="w-5 h-5" aria-hidden="true" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
