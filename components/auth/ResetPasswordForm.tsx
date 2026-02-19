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
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-gray-200/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Đặt lại mật khẩu</h1>
                    <p className="text-gray-500">Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3 text-green-700 text-sm animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm animate-in shake duration-500">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Mật khẩu mới</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Xác nhận mật khẩu</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-gray-900"
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
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200 flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Đặt lại mật khẩu
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
