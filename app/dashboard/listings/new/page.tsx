import { requireAuth } from '@/lib/auth/requireAuth'
import { ListingForm } from '@/components/listings/ListingForm'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Profile } from '@/types/profile'

export default async function NewListingPage() {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <ListingForm initialProfile={profile as Profile} mode="create" />
        </main>
    )
}
