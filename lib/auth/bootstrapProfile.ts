import { SupabaseClient } from '@supabase/supabase-js'

export async function bootstrapProfile(supabase: SupabaseClient) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        console.error('Error fetching user during bootstrap:', userError.message)
        return null
    }

    if (!user) {
        return null
    }

    // Check if profile already exists
    const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id, email, lock_status')
        .eq('id', user.id)
        .maybeSingle()

    if (selectError) {
        console.error('Error checking existing profile:', selectError.message)
        return null
    }

    // If profile already exists, do nothing (idempotent behavior)
    if (existingProfile) {
        return existingProfile
    }

    // Insert new profile only if it does NOT exist
    const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            email: user.email,
            role: 'user',
            coin_balance: 0,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error inserting profile during bootstrap:', insertError.message)
        return null
    }

    return insertedProfile
}
