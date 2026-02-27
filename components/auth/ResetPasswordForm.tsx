'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { resetPasswordAction } from '@/app/auth/reset-password/actions'
import Turnstile from './Turnstile'

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (!captchaToken) {
            setError('Vui lòng xác thực CAPTCHA.')
            return
        }

        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('password', password)
        formData.append('captcha_token', captchaToken)

        const result = await resetPasswordAction(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setMessage('Mật khẩu đã được thay đổi thành công! Đang chuyển hướng...')
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 2000)
        }
    }

    return (
        <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-200/40">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Đặt lại mật khẩu</h1>
                    <p className="text-sm text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                {message && (
                    <div className="mb-5 p-3.5 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2.5 text-green-700 text-xs animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-700 text-xs animate-in shake duration-500">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-gray-700 ml-0.5">Mật khẩu mới</label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-gray-700 ml-0.5">Xác nhận mật khẩu</label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm text-gray-900"
                            />
                        </div>
                    </div>

                    <Turnstile
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        onError={() => setCaptchaToken(null)}
                    />

                    <button
                        type="submit"
                        disabled={loading || !!message}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Đặt lại mật khẩu
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
