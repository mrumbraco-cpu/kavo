'use client'

import { useState } from 'react'
import { User, Mail, Shield, Phone, MessageSquare, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { updateProfile, updatePassword } from '@/app/dashboard/profile/actions'
import { Profile } from '@/types/profile'
import { formatDate } from '@/lib/utils/format'

interface ProfileContentProps {
    user: any;
    profile: Profile | null;
}

export default function ProfileContent({ user, profile }: ProfileContentProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Form states
    const [phone, setPhone] = useState(profile?.phone || '')
    const [zalo, setZalo] = useState(profile?.zalo || '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append('phone', phone)
        formData.append('zalo', zalo)

        const result = await updateProfile(formData)

        if (result.success) {
            setMessage({ type: 'success', text: result.message || 'Thành công' })
            setIsEditing(false)
        } else {
            setMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra' })
        }
        setLoading(false)
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' })
            return
        }

        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append('password', password)
        formData.append('confirmPassword', confirmPassword)

        const result = await updatePassword(formData)

        if (result.success) {
            setMessage({ type: 'success', text: result.message || 'Thành công' })
            setIsChangingPassword(false)
            setPassword('')
            setConfirmPassword('')
        } else {
            setMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra' })
        }
        setLoading(false)
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thông tin tài khoản</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Quản lý thông tin cá nhân và cài đặt bảo mật
                    </p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Banner Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl -ml-24 -mb-24"></div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
                        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-2xl">
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200">
                                <span className="text-4xl font-black text-blue-600">
                                    {user.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{user.email}</h2>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${profile?.role === 'admin'
                                    ? 'bg-amber-400 text-amber-950'
                                    : 'bg-white/20 text-white backdrop-blur-md'
                                    }`}>
                                    {profile?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                                </span>
                                <span className="text-blue-100 text-sm opacity-80">
                                    Gia nhập: {formatDate(user.created_at || '')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8">
                    {message && (
                        <div className={`mb-8 p-4 rounded-2xl border flex items-start gap-3 animate-in zoom-in duration-300 ${message.type === 'success'
                            ? 'bg-green-50 border-green-100 text-green-800'
                            : 'bg-red-50 border-red-100 text-red-800'
                            }`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Static Info: Email & ID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Địa chỉ Email</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500">
                                    <Mail className="w-4 h-4" aria-hidden="true" />
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">ID Tài khoản</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500">
                                    <Lock className="w-4 h-4" aria-hidden="true" />
                                    <span className="text-sm font-mono">{user.id.slice(0, 16)}…</span>
                                </div>
                            </div>
                        </div>

                        {/* Editable Section: Profile Information */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Thông tin liên hệ</h3>
                                {!isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl active:scale-95"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Số điện thoại</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="Nhập số điện thoại"
                                                    autoComplete="tel"
                                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Số Zalo</label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                                <input
                                                    type="tel"
                                                    value={zalo}
                                                    onChange={(e) => setZalo(e.target.value)}
                                                    placeholder="Nhập số Zalo"
                                                    autoComplete="tel"
                                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false)
                                                setPhone(profile?.phone || '')
                                                setZalo(profile?.zalo || '')
                                            }}
                                            className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                                        >
                                            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Điện thoại</p>
                                        <p className="font-semibold text-gray-900">{profile?.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Zalo</p>
                                        <p className="font-semibold text-gray-900">{profile?.zalo || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Editable Section: Password */}
                        <section className="pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Bảo mật</h3>
                                {!isChangingPassword && (
                                    <button
                                        type="button"
                                        onClick={() => setIsChangingPassword(true)}
                                        className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 px-4 py-2 rounded-xl active:scale-95"
                                    >
                                        Đổi mật khẩu
                                    </button>
                                )}
                            </div>

                            {isChangingPassword && (
                                <form onSubmit={handleUpdatePassword} className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu mới</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="Tối thiểu 6 ký tự"
                                                autoComplete="new-password"
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-gray-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Xác nhận mật khẩu</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                placeholder="Nhập lại mật khẩu mới"
                                                autoComplete="new-password"
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsChangingPassword(false)
                                                setPassword('')
                                                setConfirmPassword('')
                                            }}
                                            className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                                        >
                                            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                                            Cập nhật mật khẩu
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="flex gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                        <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-blue-900">Bảo mật ưu tiên</h3>
                        <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                            Việc thay đổi các thông tin nhạy cảm có thể yêu cầu bạn đăng nhập lại để xác thực danh tính. Hệ thống luôn mã hóa dữ liệu cá nhân của bạn.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
