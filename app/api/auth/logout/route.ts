import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = await createServerSupabaseClient()

        const { error } = await supabase.auth.signOut()

        if (error) {
            return NextResponse.json(
                { error: 'Failed to logout' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
