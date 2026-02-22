'use server'

import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ListingStatus } from '@/types/listing'
import { encrypt } from '@/lib/utils/encryption'

export async function createListing(formData: FormData): Promise<{ success: boolean; listingId?: string; error?: string }> {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const space_type = formData.get('space_type') as string
    const location_type = formData.get('location_type') as string
    const price_min = parseInt(formData.get('price_min') as string) || 0
    const price_max = parseInt(formData.get('price_max') as string) || 0
    const detailed_address = formData.get('detailed_address') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)

    const phone = formData.get('phone') as string
    const zalo = formData.get('zalo') as string

    // Multi-select fields (tags)
    const suitable_for = (formData.get('suitable_for') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const not_suitable_for = (formData.get('not_suitable_for') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const amenities = (formData.get('amenities') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const nearby_features = (formData.get('nearby_features') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

    // Time Slots
    const time_slots = (formData.get('time_slots') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

    // Validation
    if (!title) return { success: false, error: 'Tiêu đề là bắt buộc' }
    if (!phone) return { success: false, error: 'Số điện thoại là bắt buộc' }
    if (!space_type) return { success: false, error: 'Loại hình không gian là bắt buộc' }
    if (!location_type) return { success: false, error: 'Loại vị trí là bắt buộc' }
    if (!detailed_address) return { success: false, error: 'Địa chỉ chi tiết là bắt buộc' }
    if (isNaN(latitude)) return { success: false, error: 'Vĩ độ là bắt buộc và phải là số' }
    if (isNaN(longitude)) return { success: false, error: 'Kinh độ là bắt buộc và phải là số' }

    // Images
    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []

    const { data: listing, error } = await supabase
        .from('listings')
        .insert({
            owner_id: user.id,
            title,
            description,
            space_type,
            location_type,
            price_min,
            price_max,
            detailed_address,
            latitude,
            longitude,
            suitable_for,
            not_suitable_for,
            amenities,
            nearby_features,
            time_slots,
            status: 'pending' as ListingStatus,
            images: [] // Initially empty
        })

        .select('id')
        .single()

    if (error) {
        throw new Error(error.message)
    }

    if (listing) {
        // Upload images if any
        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                if (file.size === 0) continue

                const buffer = await file.arrayBuffer()
                const base64 = Buffer.from(buffer).toString('base64')
                const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

                const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                const { data: uploadData, error: uploadError } = await supabase.functions.invoke('github-image-handler', {
                    body: {
                        action: 'upload',
                        listingId: listing.id,
                        fileName,
                        content: base64
                    },
                    headers: {
                        Authorization: `Bearer ${serviceRoleKey}`
                    }
                })

                if (uploadError) {
                    console.error('Error uploading image:', uploadError)
                } else if (uploadData?.url) {
                    imageUrls.push(uploadData.url)
                }
            }

            // Update listing with image URLs
            if (imageUrls.length > 0) {
                await supabase
                    .from('listings')
                    .update({ images: imageUrls })
                    .eq('id', listing.id)
            }
        }

        const phone_encrypted = phone ? encrypt(phone) : null
        const zalo_encrypted = zalo ? encrypt(zalo) : null

        const { error: contactError } = await supabase
            .from('listing_contacts')
            .insert({
                listing_id: listing.id,
                phone_encrypted,
                zalo_encrypted
            })

        if (contactError) {
            console.error('Error saving listing contacts:', contactError)
        }
    }

    return { success: true, listingId: listing.id }
}
