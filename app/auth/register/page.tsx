import RegisterForm from '@/components/auth/RegisterForm'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { redirect } from 'next/navigation'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const user = await getCurrentUser()
    const { next } = await searchParams

    if (user) {
        const redirectTo = next && next.startsWith('/') && next !== '/' ? next : '/dashboard'
        redirect(redirectTo)
    }

    return <RegisterForm />
}
