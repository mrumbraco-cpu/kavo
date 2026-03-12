import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from './getCurrentUser'
import { bootstrapProfile } from '@/lib/auth/bootstrapProfile'

export async function requireAuth() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Immediate Hard Lock Check & Profile Consistency
    const supabase = await createServerSupabaseClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('lock_status')
        .eq('id', user.id)
        .maybeSingle()

    // If profile is missing, ensure we create it so FK constraints (e.g., listings) do not fail
    if (!profile) {
        await bootstrapProfile(supabase)
    }

    if (profile?.lock_status === 'hard') {
        // Clear session and redirect
        await supabase.auth.signOut()
        redirect('/auth/login?error=account_hard_locked')
    }

    return user
}
