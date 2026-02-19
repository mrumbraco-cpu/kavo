import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from './getCurrentUser'

export async function requireAdmin() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/login')
    }

    const supabase = await createServerSupabaseClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    return user
}
