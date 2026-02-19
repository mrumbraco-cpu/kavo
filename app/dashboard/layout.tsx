import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Fetch user profile to get coin balance
    const { data: profile } = await supabase
        .from('profiles')
        .select('coin_balance')
        .eq('id', user.id)
        .single()

    const coinBalance = profile?.coin_balance || 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <DashboardHeader userEmail={user.email || ''} coinBalance={coinBalance} />

            <div className="flex">
                {/* Desktop Sidebar */}
                <DashboardSidebar userEmail={user.email || ''} coinBalance={coinBalance} />

                {/* Main Content */}
                <main className="flex-1 lg:ml-64">
                    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
