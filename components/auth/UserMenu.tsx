'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    User,
    Coins,
    FileText,
    Heart,
    Settings,
    LogOut,
    ChevronDown,
    Menu,
    X
} from 'lucide-react'

interface UserMenuProps {
    userEmail: string
    coinBalance: number
}

export default function UserMenu({ userEmail, coinBalance }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

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
            label: 'Đã lưu',
            href: '/dashboard/favorites',
        },
        {
            icon: Settings,
            label: 'Cập nhật tài khoản',
            href: '/dashboard/profile',
        },
    ]

    return (
        <>
            {/* Desktop Menu */}
            <div className="hidden md:block relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                            {userEmail}
                        </span>
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                            <p className="text-xs text-gray-500 mt-1">Thành viên SPSHARE</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${item.badgeColor}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 pt-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors group text-left"
                            >
                                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                                    Đăng xuất
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-700" />
                ) : (
                    <Menu className="w-6 h-6 text-gray-700" />
                )}
            </button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu Panel */}
                    <div className="md:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                        {userEmail.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                                            {userEmail}
                                        </p>
                                        <p className="text-xs text-gray-500">Thành viên SPSHARE</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <div className="flex-1 overflow-y-auto py-4">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors active:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <item.icon className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {item.label}
                                            </span>
                                        </div>
                                        {item.badge && (
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Logout Button */}
                            <div className="p-4 border-t border-gray-200">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm active:bg-red-200"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
