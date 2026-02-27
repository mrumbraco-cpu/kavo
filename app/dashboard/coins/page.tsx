import { requireAuth } from '@/lib/auth/requireAuth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Coins, Plus, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

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

    const transactionTypes: Record<string, { label: string; icon: any; color: string; bg: string }> = {
        topup: { label: 'Nạp xu', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        reward: { label: 'Thưởng', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        unlock: { label: 'Mở khóa liên hệ', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    }

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
            {/* Header — consistent with other dashboard pages */}
            <div className="mb-10 px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">Wallet</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            Tài khoản xu
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            Quản lý số dư xu và lịch sử giao dịch của bạn
                        </p>
                    </div>

                    <Link
                        href="/dashboard/coins/topup"
                        className="group relative inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-amber-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Plus className="relative w-5 h-5" aria-hidden="true" />
                        <span className="relative">Nạp xu</span>
                        <ArrowUpRight className="relative w-4 h-4 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
                    </Link>
                </div>
            </div>

            {/* Balance Card */}
            <div className="mx-4 sm:mx-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 mb-10 shadow-2xl shadow-blue-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl -ml-24 -mb-24" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-semibold mb-2 uppercase tracking-wider">Số dư hiện tại</p>
                        <p className="text-white text-5xl font-black tracking-tight">
                            {coinBalance.toLocaleString('vi-VN')}
                            <span className="text-2xl text-blue-200 ml-2 font-bold">xu</span>
                        </p>
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                        <Coins className="w-10 h-10 text-white" aria-hidden="true" />
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="mx-4 sm:mx-0 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Lịch sử giao dịch</h2>
                    {transactions && transactions.length > 0 && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{transactions.length} giao dịch</span>
                    )}
                </div>

                {!transactions || transactions.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-5">
                            <Coins className="h-9 w-9 text-amber-200" aria-hidden="true" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Chưa có giao dịch nào</h3>
                        <p className="text-sm text-slate-400 max-w-xs">Lịch sử giao dịch của bạn sẽ hiển thị ở đây sau khi nạp xu hoặc mở khóa liên hệ.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {transactions.map((transaction: any) => {
                            const typeInfo = transactionTypes[transaction.type] || transactionTypes.topup
                            const Icon = typeInfo.icon
                            const isPositive = transaction.amount > 0

                            return (
                                <div key={transaction.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-5 h-5 ${typeInfo.color}`} aria-hidden="true" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {typeInfo.label}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {formatDate(transaction.created_at)}
                                                </p>
                                                {transaction.reference && (
                                                    <p className="text-[10px] text-slate-300 mt-0.5 font-mono">
                                                        Ref: {transaction.reference}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`text-right flex-shrink-0 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            <p className="text-base font-black">
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
