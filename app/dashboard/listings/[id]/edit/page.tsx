import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { ListingForm } from '@/components/listings/ListingForm'
import { redirect, notFound } from 'next/navigation'
import { decrypt } from '@/lib/utils/encryption'

interface EditListingPageProps {
    params: {
        id: string
    }
}

export default async function EditListingPage({ params }: EditListingPageProps) {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const { id } = await params

    // 1. Fetch current user profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    // 2. Use service role client if admin to bypass RLS
    const db = isAdmin ? createServiceRoleClient() : supabase

    // Fetch listing data
    const { data: listing, error } = await db
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !listing) {
        notFound()
    }

    if (listing.owner_id !== user.id && !isAdmin) {
        redirect('/dashboard/listings')
    }

    if (listing.is_locked && !isAdmin) {
        redirect('/dashboard/listings')
    }

    if (listing.status === 'expired' && !isAdmin) {
        redirect('/dashboard/listings')
    }

    // Fetch contact info separately from listing_contacts table
    const { data: contacts } = await db
        .from('listing_contacts')
        .select('*')
        .eq('listing_id', listing.id)
        .single()

    // Decrypt phone/zalo
    let initialPhone = ''
    let initialZalo = ''

    if (contacts) {
        if (contacts.phone_encrypted) {
            try {
                initialPhone = decrypt(contacts.phone_encrypted)
            } catch (e) {
                console.error('Failed to decrypt phone', e)
            }
        }
        if (contacts.zalo_encrypted) {
            try {
                initialZalo = decrypt(contacts.zalo_encrypted)
            } catch (e) {
                console.error('Failed to decrypt zalo', e)
            }
        }
    } else {
        // Fallback: If no listing contacts, try to get owner's profile info
        if (listing.owner_id === user.id) {
            initialPhone = profile?.phone || ''
            initialZalo = profile?.zalo || ''
        } else {
            const { data: ownerProfile } = await db
                .from('profiles')
                .select('phone, zalo')
                .eq('id', listing.owner_id)
                .single()
            initialPhone = ownerProfile?.phone || ''
            initialZalo = ownerProfile?.zalo || ''
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <ListingForm
                initialProfile={profile || undefined}
                initialListing={listing}
                initialPhone={initialPhone}
                initialZalo={initialZalo}
                mode="edit"
            />
        </main>
    )
}
