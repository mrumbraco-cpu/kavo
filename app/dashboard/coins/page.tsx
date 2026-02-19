import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Coins, Plus, TrendingUp, TrendingDown } from 'lucide-react'

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default async function CoinsPage() {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient()

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('coin_balance')
        .eq('id', user.id)
        .single()

    // Fetch recent transactions
    const { data: transactions } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    const coinBalance = profile?.coin_balance || 0

    const transactionTypes: Record<string, { label: string; icon: any; color: string }> = {
        topup: { label: 'Nạp xu', icon: TrendingUp, color: 'text-green-600' },
        reward: { label: 'Thưởng', icon: TrendingUp, color: 'text-blue-600' },
        unlock: { label: 'Mở khóa liên hệ', icon: TrendingDown, color: 'text-red-600' },
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tài khoản xu</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Quản lý số dư xu và lịch sử giao dịch của bạn
                </p>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium mb-2">Số dư hiện tại</p>
                        <p className="text-white text-4xl font-bold">
                            {coinBalance.toLocaleString('vi-VN')} xu
                        </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Coins className="w-8 h-8 text-white" />
                    </div>
                </div>
                <Link
                    href="/dashboard/coins/topup"
                    className="mt-6 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md flex items-center gap-2 inline-flex"
                >
                    <Plus className="w-5 h-5" />
                    Nạp xu
                </Link>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h2>
                </div>

                {!transactions || transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Coins className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Chưa có giao dịch nào</h3>
                        <p className="mt-1 text-sm text-gray-500">Lịch sử giao dịch của bạn sẽ hiển thị ở đây.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {transactions.map((transaction: any) => {
                            const typeInfo = transactionTypes[transaction.type] || transactionTypes.topup
                            const Icon = typeInfo.icon
                            const isPositive = transaction.amount > 0

                            return (
                                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${typeInfo.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {typeInfo.label}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(transaction.created_at).toLocaleString('vi-VN')}
                                                </p>
                                                {transaction.reference && (
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        Ref: {transaction.reference}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            <p className="text-lg font-semibold">
                                                {isPositive ? '+' : ''}{transaction.amount.toLocaleString('vi-VN')} xu
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
