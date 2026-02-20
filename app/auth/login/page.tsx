import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { redirect } from 'next/navigation'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string, error?: string, message?: string }> }) {
    const user = await getCurrentUser()
    const { next } = await searchParams

    if (user) {
        const redirectTo = next && next.startsWith('/') && next !== '/' ? next : '/dashboard'
        redirect(redirectTo)
    }

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-white">
            {/* Soft Premium Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <Link href="/" className="mb-12 flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-200"></div>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">SPSHARE</span>
                </Link>

                <LoginForm />
            </div>
        </main>
    )
}
