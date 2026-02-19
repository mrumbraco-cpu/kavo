import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Profile } from '@/types/profile'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // MANDATORY ROLE GUARD
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, coin_balance')
        .eq('id', user.id)
        .single()

    if ((profile as Profile)?.role !== 'admin') {
        redirect('/')
    }

    const coinBalance = (profile as Profile)?.coin_balance || 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <AdminHeader userEmail={user.email || ''} coinBalance={coinBalance} />

            <div className="flex">
                {/* Desktop Sidebar */}
                <AdminSidebar />

                {/* Main Content */}
                <main className="flex-1 lg:ml-64">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
