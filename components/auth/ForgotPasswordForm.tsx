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
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-gray-200/50 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Kiểm tra email của bạn</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>.
                    </p>
                    <Link
                        href="/auth/login"
                        className="block w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98]"
                    >
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại đăng nhập
            </Link>

            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-gray-200/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Quên mật khẩu?</h1>
                    <p className="text-gray-500">Đừng lo, chúng tôi sẽ gởi link khôi phục cho bạn</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm animate-in shake duration-500">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email khôi phục</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
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
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Gửi yêu cầu
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
