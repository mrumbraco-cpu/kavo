'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import { forgotPasswordAction } from '@/app/auth/forgot-password/actions'
import Turnstile from './Turnstile'

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!captchaToken) {
            setError('Vui lòng xác thực CAPTCHA.')
            return
        }

        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('captcha_token', captchaToken)

        const result = await forgotPasswordAction(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-200/40 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Kiểm tra email của bạn</h2>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>.
                    </p>
                    <Link
                        href="/auth/login"
                        className="block w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98]"
                    >
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-[13px] font-bold text-gray-400 hover:text-gray-900 mb-6 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại đăng nhập
            </Link>

            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-200/40">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Quên mật khẩu?</h1>
                    <p className="text-sm text-gray-500">Đừng lo, chúng tôi sẽ gởi link khôi phục cho bạn</p>
                </div>

                {error && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-700 text-xs animate-in shake duration-500">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-gray-700 ml-0.5">Email khôi phục</label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
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
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Gửi yêu cầu
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
