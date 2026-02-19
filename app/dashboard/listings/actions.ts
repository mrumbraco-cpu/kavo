'use server'

import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ListingStatus } from '@/types/listing'
import { encrypt } from '@/lib/utils/encryption'

export async function createListing(formData: FormData): Promise<{ success: boolean; listingId?: string; error?: string }> {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    const title = formData.get('title') as string

    // Lock Status & Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('lock_status, role')
        .eq('id', user.id)
        .single()

    if ((profile?.lock_status === 'soft' || profile?.lock_status === 'hard') && profile?.role !== 'admin') {
        return { success: false, error: 'Tài khoản của bạn đã bị khóa tính năng đăng bài.' }
    }
    const description = formData.get('description') as string
    const space_type = formData.get('space_type') as string
    const location_type = formData.get('location_type') as string
    const price_min = parseInt(formData.get('price_min') as string) || 0
    const price_max = parseInt(formData.get('price_max') as string) || 0
    const province_old = formData.get('province_old') as string
    const district_old = formData.get('district_old') as string
    const province_new = formData.get('province_new') as string
    const ward_new = formData.get('ward_new') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)

    const address_old_admin = formData.get('address_old_admin') as string
    const address_new_admin = formData.get('address_new_admin') as string

    const phone = formData.get('phone') as string
    const zalo = formData.get('zalo') as string

    // Multi-select fields (tags)
    const suitable_for = (formData.get('suitable_for') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const not_suitable_for = (formData.get('not_suitable_for') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const amenities = (formData.get('amenities') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const nearby_features = (formData.get('nearby_features') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

    // Time Slots
    const time_slots = (formData.get('time_slots') as string)?.split(';').map(s => s.trim()).filter(Boolean) || []

    // Validation
    if (!title) return { success: false, error: 'Tiêu đề là bắt buộc' }
    if (!phone) return { success: false, error: 'Số điện thoại là bắt buộc' }
    if (!space_type) return { success: false, error: 'Loại hình không gian là bắt buộc' }
    if (!location_type) return { success: false, error: 'Loại vị trí là bắt buộc' }
    if (!province_old) return { success: false, error: 'Tỉnh/thành (hệ thống cũ) là bắt buộc' }
    if (!district_old) return { success: false, error: 'Quận/huyện (hệ thống cũ) là bắt buộc' }
    if (!province_new) return { success: false, error: 'Tỉnh/thành (hệ thống mới) là bắt buộc' }
    if (!ward_new) return { success: false, error: 'Phường/xã (hệ thống mới) là bắt buộc' }
    if (isNaN(latitude)) return { success: false, error: 'Vĩ độ là bắt buộc và phải là số' }
    if (isNaN(longitude)) return { success: false, error: 'Kinh độ là bắt buộc và phải là số' }

    // Images
    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: string[] = []

    // RATE LIMITING: Check if user has exceeded submission limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: rateLimitError } = await supabase
        .from('listing_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo)

    if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError)
    }

    const limit = profile?.role === 'admin' ? 180 : 10
    if (count !== null && count >= limit) {
        return {
            success: false,
            error: `Bạn đã vượt quá giới hạn ${limit} lần đăng/cập nhật tin trong 1 giờ. Vui lòng thử lại sau.`
        }
    }

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
            province_old,
            district_old,
            province_new,
            ward_new,
            latitude,
            longitude,
            address_old_admin,
            address_new_admin,
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

                const internalSecret = process.env.INTERNAL_SECRET_KEY;

                const { data: uploadData, error: uploadError } = await supabase.functions.invoke('github-image-handler', {
                    body: {
                        action: 'upload',
                        listingId: listing.id,
                        fileName,
                        content: base64
                    },
                    headers: {
                        Authorization: `Bearer ${internalSecret}`
                    }
                })

                if (uploadError) {
                    console.error('Error uploading image:', uploadError)
                    if (uploadError instanceof Error && 'context' in uploadError) {
                        try {
                            const response = (uploadError as any).context as Response;
                            if (response && response.text) {
                                const errorText = await response.text();
                                console.error('Edge Function Error Detail:', errorText);
                            }
                        } catch (e) {
                            console.error('Could not read error detail', e);
                        }
                    }
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

        // Record submission for rate limiting
        await supabase
            .from('listing_submissions')
            .insert({
                user_id: user.id,
                listing_id: listing.id,
                action: 'create'
            })
    }

    return { success: true, listingId: listing.id }
}

export async function updateListing(listingId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // 0. Check Lock Status
    const { data: profile } = await supabase
        .from('profiles')
        .select('lock_status, role')
        .eq('id', user.id)
        .single()

    if ((profile?.lock_status === 'soft' || profile?.lock_status === 'hard') && profile?.role !== 'admin') {
        return { success: false, error: 'Tài khoản của bạn đã bị khóa tính năng chỉnh sửa bài.' }
    }

    const isAdmin = profile?.role === 'admin'
    const db = isAdmin ? createServiceRoleClient() : supabase

    // 1. Check ownership
    const { data: existingListing, error: fetchError } = await supabase
        .from('listings')
        .select('owner_id, is_locked')
        .eq('id', listingId)
        .single()

    if (fetchError || !existingListing) {
        return { success: false, error: 'Không tìm thấy tin đăng' }
    }

    if (existingListing.owner_id !== user.id) {
        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return { success: false, error: 'Bạn không có quyền chỉnh sửa tin đăng này' }
        }
    } else {
        // If owner, check if the listing is locked. Admin bypasses this.
        if (existingListing.is_locked && profile?.role !== 'admin') {
            return { success: false, error: 'Tin đăng này đã bị khóa bởi Admin và không thể chỉnh sửa.' }
        }
    }

    // 2. Extract Data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const space_type = formData.get('space_type') as string
    const location_type = formData.get('location_type') as string
    const price_min = parseInt(formData.get('price_min') as string) || 0
    const price_max = parseInt(formData.get('price_max') as string) || 0
    const province_old = formData.get('province_old') as string
    const district_old = formData.get('district_old') as string
    const province_new = formData.get('province_new') as string
    const ward_new = formData.get('ward_new') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)

    const address_old_admin = formData.get('address_old_admin') as string
    const address_new_admin = formData.get('address_new_admin') as string

    const phone = formData.get('phone') as string
    const zalo = formData.get('zalo') as string

    // Multi-select fields
    const suitable_for = (formData.get('suitable_for') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const not_suitable_for = (formData.get('not_suitable_for') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const amenities = (formData.get('amenities') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const nearby_features = (formData.get('nearby_features') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

    // Time Slots
    const time_slots = (formData.get('time_slots') as string)?.split(';').map(s => s.trim()).filter(Boolean) || []

    // Validation
    if (!title) return { success: false, error: 'Tiêu đề là bắt buộc' }
    if (!phone) return { success: false, error: 'Số điện thoại là bắt buộc' }
    if (!space_type) return { success: false, error: 'Loại hình không gian là bắt buộc' }
    if (!location_type) return { success: false, error: 'Loại vị trí là bắt buộc' }
    if (isNaN(latitude) || isNaN(longitude)) return { success: false, error: 'Tọa độ không hợp lệ' }

    // RATE LIMITING: Check if user has exceeded submission limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: rateLimitError } = await supabase
        .from('listing_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo)

    if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError)
    }

    const limit = profile?.role === 'admin' ? 180 : 10
    if (count !== null && count >= limit) {
        return {
            success: false,
            error: `Bạn đã vượt quá giới hạn ${limit} lần đăng/cập nhật tin trong 1 giờ. Vui lòng thử lại sau.`
        }
    }

    // 3. Handle Images
    const imageFiles = formData.getAll('images') as File[]
    const keptImages = formData.getAll('kept_images') as string[]
    const finalImageUrls: string[] = [...keptImages]

    // Upload new images
    if (imageFiles.length > 0) {
        for (const file of imageFiles) {
            if (file.size === 0) continue

            const buffer = await file.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

            const internalSecret = process.env.INTERNAL_SECRET_KEY;

            const { data: uploadData, error: uploadError } = await supabase.functions.invoke('github-image-handler', {
                body: {
                    action: 'upload',
                    listingId: listingId,
                    fileName,
                    content: base64
                },
                headers: {
                    Authorization: `Bearer ${internalSecret}`
                }
            })

            if (uploadError) {
                console.error('Error uploading image:', uploadError)
                if (uploadError instanceof Error && 'context' in uploadError) {
                    try {
                        const response = (uploadError as any).context as Response;
                        if (response && response.text) {
                            const errorText = await response.text();
                            console.error('Edge Function Error Detail:', errorText);
                        }
                    } catch (e) {
                        console.error('Could not read error detail', e);
                    }
                }
                // Continue with other images even if one fails
            } else if (uploadData?.url) {
                finalImageUrls.push(uploadData.url)
            }
        }
    }

    // Identify images to be deleted (present in CURRENT DB but NOT in KEPT images)
    // currentListing is fetched below but we need it here for deletion logic.
    // Let's move the fetching UP.

    const { data: currentListing } = await supabase
        .from('listings')
        .select('title, address_old_admin, address_new_admin, description, images, owner_id, status')
        .eq('id', listingId)
        .single();

    if (currentListing && currentListing.images && currentListing.images.length > 0) {
        const imagesToDelete = currentListing.images.filter((img: string) => !keptImages.includes(img));

        if (imagesToDelete.length > 0) {
            // Based on previous usage, it seems we might need to parse.
            // However, without seeing the handler code, I'll pass the URL as 'fileName' or add a 'fileUrl' param if supported.
            // Wait, standard github upload returns a raw URL.
            // To delete, we need the path in the repo.
            // The URL structure: https://raw.githubusercontent.com/OWNER/REPO/main/listings/LISTING_ID/FILENAME
            const internalSecret = process.env.INTERNAL_SECRET_KEY;
            // Execute deletions in parallel
            await Promise.all(imagesToDelete.map(async (imageUrl: string) => {
                try {
                    // primitive extraction: last part of URL
                    const fileName = imageUrl.split('/').pop();
                    if (fileName) {
                        await supabase.functions.invoke('github-image-handler', {
                            body: {
                                action: 'delete',
                                listingId: listingId,
                                fileName: fileName
                            },
                            headers: {
                                Authorization: `Bearer ${internalSecret}`
                            }
                        })
                    }
                } catch (err) {
                    console.error('Failed to delete image:', imageUrl, err);
                }
            }));
        }
    }

    // 4. Update Database
    // Check if critical fields have changed to trigger status reset
    // (currentListing is already fetched above)

    let newStatus = currentListing?.status;

    // Helper to compare arrays (for images)
    const areImagesDifferent = (oldImages: string[], newImages: string[]) => {
        if (!oldImages && !newImages) return false;
        if (!oldImages || !newImages) return true;
        if (oldImages.length !== newImages.length) return true;
        // Check if every new image exists in old images (order doesn't matter for content, but we check exact match for simplicity first)
        // If order matters or content matters:
        // Actually, we are effectively adding new ones and removing some.
        // If finalImageUrls is different from currentListing.images, then changed.
        const sortedOld = [...oldImages].sort();
        const sortedNew = [...newImages].sort();
        return JSON.stringify(sortedOld) !== JSON.stringify(sortedNew);
    };

    const hasCriticalChanges =
        title !== currentListing?.title ||
        address_old_admin !== currentListing?.address_old_admin ||
        address_new_admin !== currentListing?.address_new_admin ||
        description !== currentListing?.description ||
        areImagesDifferent(currentListing?.images || [], finalImageUrls);

    if (hasCriticalChanges && currentListing?.status === 'approved') {
        newStatus = 'pending';
    }

    const { error: updateError } = await db
        .from('listings')
        .update({
            title,
            description,
            space_type,
            location_type,
            price_min,
            price_max,
            province_old,
            district_old,
            province_new,
            ward_new,
            latitude,
            longitude,
            address_old_admin,
            address_new_admin,
            suitable_for,
            not_suitable_for,
            amenities,
            nearby_features,
            time_slots,
            status: newStatus as ListingStatus,
            images: finalImageUrls,
            updated_at: new Date().toISOString()
        })
        .eq('id', listingId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 5. Update Contacts
    const phone_encrypted = phone ? encrypt(phone) : null
    const zalo_encrypted = zalo ? encrypt(zalo) : null

    const { error: contactError } = await db
        .from('listing_contacts')
        .upsert({
            listing_id: listingId,
            phone_encrypted,
            zalo_encrypted
        }, { onConflict: 'listing_id' })

    if (contactError) {
        console.error('Error updating contacts:', contactError)
    }

    // Record submission for rate limiting
    await supabase
        .from('listing_submissions')
        .insert({
            user_id: user.id,
            listing_id: listingId,
            action: 'update'
        })

    // 6. Revalidate
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/dashboard/listings')
    revalidatePath('/admin/listings')
    revalidatePath(`/dashboard/listings/${listingId}/edit`)

    return { success: true }
}

export async function toggleListingVisibility(listingId: string): Promise<{ success: boolean; error?: string }> {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // 0. Check Lock Status
    const { data: profile } = await supabase
        .from('profiles')
        .select('lock_status')
        .eq('id', user.id)
        .single()

    if (profile?.lock_status === 'soft' || profile?.lock_status === 'hard') {
        return { success: false, error: 'Tài khoản của bạn đã bị khóa, không thể thay đổi trạng thái bài đăng.' }
    }

    // 1. Check ownership and current visibility
    const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select('owner_id, is_hidden, is_locked')
        .eq('id', listingId)
        .single()

    if (fetchError || !listing) {
        return { success: false, error: 'Không tìm thấy tin đăng' }
    }

    if (listing.owner_id !== user.id) {
        return { success: false, error: 'Bạn không có quyền thực hiện thao tác này' }
    }

    if (listing.is_locked) {
        return { success: false, error: 'Tin đăng này đã bị khóa bởi Admin và không thể thay đổi trạng thái hiển thị.' }
    }

    // 2. Toggle visibility
    const { error: updateError } = await supabase
        .from('listings')
        .update({
            is_hidden: !listing.is_hidden,
            updated_at: new Date().toISOString()
        })
        .eq('id', listingId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 3. Revalidate path to update UI
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/dashboard/listings')

    return { success: true }
}
