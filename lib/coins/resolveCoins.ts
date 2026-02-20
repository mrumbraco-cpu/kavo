/**
 * Server-side coin resolution logic.
 * NEVER call this from client components.
 *
 * Logic:
 * 1. Calculate base rate coins: floor(amount / 1000) * coins_per_1000vnd
 * 2. Find best matching tier: highest min_amount_vnd tier where min_amount_vnd <= amount
 * 3. Use whichever gives MORE coins: tier OR base rate
 *    → This ensures promotions always benefit users, never penalise them.
 */

import { createServiceRoleClient } from '@/lib/supabase/server'

export interface CoinResolutionResult {
    coins: number
    /** 'tier' if a promotional tier was used, 'base_rate' otherwise */
    source: 'tier' | 'base_rate'
    /** UUID of the tier used, if applicable */
    tier_id?: string
    /** Snapshot of the base rate used for audit */
    base_rate_used: number
}

export async function resolveCoinsForAmount(
    amountVnd: number
): Promise<CoinResolutionResult> {
    const supabase = createServiceRoleClient()

    // Fetch base config (single row, id=1)
    const { data: config, error: configError } = await supabase
        .from('coin_exchange_config')
        .select('coins_per_1000vnd, min_topup_vnd')
        .eq('id', 1)
        .single()

    if (configError || !config) {
        // Fallback: original 1:1 behaviour (1 VNĐ = 1 xu)
        console.warn('[resolveCoins] Could not fetch exchange config, falling back to 1:1', configError)
        return { coins: amountVnd, source: 'base_rate', base_rate_used: 1 }
    }

    // Fetch active tiers, sorted highest min_amount first
    const { data: tiers, error: tiersError } = await supabase
        .from('coin_topup_tiers')
        .select('id, min_amount_vnd, coins_granted')
        .eq('is_active', true)
        .order('min_amount_vnd', { ascending: false })

    if (tiersError) {
        console.warn('[resolveCoins] Could not fetch tiers, using base rate', tiersError)
    }

    // Base rate coins for this amount
    const baseCoins = Math.max(1, Math.floor(amountVnd / 1000) * config.coins_per_1000vnd)

    // Find the best matching tier (highest threshold that the amount qualifies for)
    const matchedTier = tiers?.find((t) => amountVnd >= t.min_amount_vnd) ?? null

    // Only apply tier if it gives strictly MORE coins than base rate
    // This guarantees tiers are always beneficial, never a penalty
    if (matchedTier && matchedTier.coins_granted > baseCoins) {
        return {
            coins: matchedTier.coins_granted,
            source: 'tier',
            tier_id: matchedTier.id,
            base_rate_used: config.coins_per_1000vnd,
        }
    }

    // Base rate wins (no tier, or tier gives fewer/equal coins than base rate)
    return {
        coins: baseCoins,
        source: 'base_rate',
        base_rate_used: config.coins_per_1000vnd,
    }
}

/**
 * Fetch tiers + base config for display on the topup page.
 * Returns data suitable for rendering (no sensitive info).
 */
export async function getTopupDisplayData() {
    const supabase = createServiceRoleClient()

    const [configRes, tiersRes] = await Promise.all([
        supabase
            .from('coin_exchange_config')
            .select('coins_per_1000vnd, min_topup_vnd')
            .eq('id', 1)
            .single(),
        supabase
            .from('coin_topup_tiers')
            .select('id, label, min_amount_vnd, coins_granted, display_order')
            .eq('is_active', true)
            .order('display_order', { ascending: true }),
    ])

    return {
        baseRate: configRes.data ?? { coins_per_1000vnd: 1, min_topup_vnd: 10000 },
        tiers: tiersRes.data ?? [],
    }
}
