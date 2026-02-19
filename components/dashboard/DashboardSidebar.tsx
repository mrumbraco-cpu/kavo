'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    PlusCircle,
    FileText,
    Heart,
    Settings,
    LogOut,
    Coins,
    LayoutDashboard,
    Home
} from 'lucide-react'

interface MenuItem {
    icon: React.ElementType
    label: string
    href: string
    badge?: string
    badgeColor?: string
}

interface DashboardSidebarProps {
    userEmail: string
    coinBalance: number
}

export default function DashboardSidebar({ userEmail, coinBalance }: DashboardSidebarProps) {
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

    const menuItems: MenuItem[] = [
        {
            icon: Coins,
            label: 'Tài khoản xu',
            href: '/dashboard/coins',
            badge: `${coinBalance.toLocaleString('vi-VN')} xu`,
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
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200 shadow-sm z-30">
            <div className="flex flex-col flex-1 overflow-y-auto">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-white font-black text-xl italic tracking-tighter">SP</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent leading-none">
                                SPSHARE
                            </h1>
                            <p className="text-[10px] text-blue-500 uppercase tracking-wider font-bold mt-1">Dashboard</p>
                        </div>
                    </Link>
                </div>

                {/* User Info & Action Button */}
                <div className="px-3 py-4 space-y-3 border-b border-gray-50">
                    {/* User Card */}
                    <div className="px-3 py-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{userEmail.split('@')[0]}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Thành viên</p>
                            </div>
                        </div>
                    </div>

                    {/* New Listing Action Button */}
                    <div className="px-2">
                        <Link
                            href="/dashboard/listings/new"
                            className="group flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform duration-300">
                                <PlusCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-black text-white uppercase tracking-wider">Đăng tin mới</span>
                        </Link>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quản lý</p>
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
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

                {/* Logout Button */}
                <div className="p-3 border-t border-gray-100">
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
    )
}
