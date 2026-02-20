import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { redirect } from 'next/navigation'
import CoinsAdminClient from './CoinsAdminClient'

export const metadata = {
    title: 'Cài đặt xu | Admin',
}

async function getAdminData() {
    const supabase = createServiceRoleClient()

    const [configRes, tiersRes] = await Promise.all([
        supabase
            .from('coin_exchange_config')
            .select('*')
            .eq('id', 1)
            .single(),
        supabase
            .from('coin_topup_tiers')
            .select('*')
            .order('display_order', { ascending: true }),
    ])

    return {
        config: configRes.data,
        tiers: tiersRes.data ?? [],
    }
}

export default async function AdminCoinsPage() {
    // Verify admin access server-side
    try {
        const user = await requireAuth()
        const supabase = createServiceRoleClient()
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            redirect('/dashboard')
        }
    } catch {
        redirect('/auth/login')
    }

    const { config, tiers } = await getAdminData()

    return <CoinsAdminClient config={config} tiers={tiers} />
}
