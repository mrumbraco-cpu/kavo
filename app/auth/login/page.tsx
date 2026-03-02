import LoginForm from '@/components/auth/LoginForm'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { redirect } from 'next/navigation'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string, error?: string, message?: string }> }) {
    const user = await getCurrentUser()
    const { next } = await searchParams

    if (user) {
        const redirectTo = next && next.startsWith('/') && next !== '/' ? next : '/dashboard'
        redirect(redirectTo)
    }

    return <LoginForm />
}
