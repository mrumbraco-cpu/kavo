import { Suspense } from 'react'
import { getTopupDisplayData } from '@/lib/coins/resolveCoins'
import TopupClient from './TopupClient'

export const metadata = {
    title: 'Nạp xu | SpShare',
    description: 'Nạp xu vào tài khoản để mở khóa thông tin liên hệ không gian.',
}

export default async function TopupPage() {
    const { baseRate, tiers } = await getTopupDisplayData()

    return (
        <Suspense>
            <TopupClient baseRate={baseRate} tiers={tiers} />
        </Suspense>
    )
}
