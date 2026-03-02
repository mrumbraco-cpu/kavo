import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { redirect } from 'next/navigation'

export default async function ForgotPasswordPage() {
    const user = await getCurrentUser()

    if (user) {
        redirect('/dashboard')
    }

    return <ForgotPasswordForm />
}
