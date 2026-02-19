import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Profile } from '@/types/profile'
import ProfileContent from '@/components/dashboard/ProfileContent'

export default async function ProfilePage() {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return <ProfileContent user={user} profile={profile as Profile} />
}
