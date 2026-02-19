import { requireAuth } from '@/lib/auth/requireAuth'
import { ListingForm } from '@/components/listings/ListingForm'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Profile } from '@/types/profile'
import { redirect } from 'next/navigation'

export default async function AdminNewListingPage() {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    return (
        <main className="min-h-screen bg-transparent flex flex-col items-center py-4 px-4 sm:px-6 lg:px-8">
            <ListingForm initialProfile={profile as Profile} mode="create" />
        </main>
    )
}
