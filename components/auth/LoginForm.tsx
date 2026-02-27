'use client'

import { useState, useEffect, Suspense } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import Turnstile from './Turnstile'

// Google Icon Component
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
)

function LoginContent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const errorParam = searchParams.get('error')
        const messageParam = searchParams.get('message')

        if (errorParam === 'account_hard_locked') {
            setError('Tài khoản của bạn đã bị khóa cứng do vi phạm chính sách của hệ thống.')
        } else if (errorParam) {
            setError(errorParam)
        }

        if (messageParam) setMessage(messageParam)
    }, [searchParams])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!captchaToken) {
            setError('Vui lòng xác thực CAPTCHA.')
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('captcha_token', captchaToken)

        const { loginAction } = await import('@/app/auth/login/actions')
        const result = await loginAction(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            const next = searchParams.get('next')
            const redirectTo = next && next.startsWith('/') && next !== '/' ? next : '/dashboard'
            router.push(redirectTo)
            router.refresh()
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)

        try {
            const next = searchParams.get('next') || '/dashboard'
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                },
            })
            if (error) throw error
        } catch (error: any) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl p-6 shadow-xl shadow-gray-200/40">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Chào mừng trở lại</h1>
                    <p className="text-sm text-gray-500">Đăng nhập để quản lý không gian</p>
                </div>

                {message && (
                    <div className="mb-5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-blue-700 text-xs animate-in zoom-in duration-300">
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

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-gray-700 ml-0.5">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-0.5">
                            <label className="text-[13px] font-semibold text-gray-700">Mật khẩu</label>
                            <Link href="/auth/forgot-password" className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">Quên mật khẩu?</Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                        disabled={loading}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Đăng nhập
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100"></span>
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase">
                            <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-[13px] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5"
                    >
                        <GoogleIcon />
                        Google
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <p className="text-gray-500 text-[13px]">
                        Chưa có tài khoản?{' '}
                        <Link href="/auth/register" className="font-bold text-blue-600 hover:text-blue-700">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginForm() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
