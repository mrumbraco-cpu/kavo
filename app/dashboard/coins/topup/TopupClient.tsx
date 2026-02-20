'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createPaymentRequest, verifyTransaction } from '@/app/dashboard/coins/topup/actions'
import { Coins, ArrowLeft, CreditCard, Gift, Zap } from 'lucide-react'
import Link from 'next/link'

interface BaseRate {
    coins_per_1000vnd: number
    min_topup_vnd: number
}

interface Tier {
    id: string
    label: string
    min_amount_vnd: number
    coins_granted: number
    display_order: number
}

interface Props {
    baseRate: BaseRate
    tiers: Tier[]
}

function computeCoins(amountVnd: number, tiers: Tier[], baseRate: BaseRate): { coins: number; isTier: boolean } {
    if (amountVnd <= 0) return { coins: 0, isTier: false }

    // Base rate coins
    const baseCoins = Math.max(1, Math.floor(amountVnd / 1000) * baseRate.coins_per_1000vnd)

    // Find best matching tier (highest min_amount_vnd <= amountVnd)
    const sorted = [...tiers].sort((a, b) => b.min_amount_vnd - a.min_amount_vnd)
    const matched = sorted.find((t) => amountVnd >= t.min_amount_vnd)

    // Tier only applies when it gives strictly more coins than base rate
    // This mirrors server-side logic — tiers must always benefit the user
    if (matched && matched.coins_granted > baseCoins) {
        return { coins: matched.coins_granted, isTier: true }
    }

    return { coins: baseCoins, isTier: false }
}

export default function TopupClient({ baseRate, tiers }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [amount, setAmount] = useState<string>(
        tiers.length > 0
            ? tiers[0].min_amount_vnd.toString()
            : '50000'
    )
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const amountNum = parseInt(amount) || 0
    const { coins: previewCoins, isTier: previewIsTier } = computeCoins(amountNum, tiers, baseRate)
    const minTopup = baseRate.min_topup_vnd ?? 10000

    // Auto-verify if redirected back with cancelled status but might be success
    useEffect(() => {
        const checkStatus = async () => {
            const status = searchParams.get('status')
            const orderId = searchParams.get('order_id')

            if (status === 'cancelled' && orderId) {
                setIsLoading(true)
                try {
                    const result = await verifyTransaction(orderId)
                    if (result.success) {
                        const next = searchParams.get('next')
                        const nextQuery = next ? `&next=${encodeURIComponent(next)}` : ''
                        router.push(`/dashboard/coins/topup/success?order_id=${orderId}${nextQuery}`)
                        return
                    } else {
                        setError('Giao dịch đã bị hủy hoặc chưa hoàn tất.')
                    }
                } catch (e) {
                    console.error('Verify error', e)
                } finally {
                    setIsLoading(false)
                }
            }
        }
        checkStatus()
    }, [searchParams, router])

    const handlePayment = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const next = searchParams.get('next')
            const result = await createPaymentRequest(amountNum, next || undefined)
            if (result.success && result.endpoint) {
                const form = document.createElement('form')
                form.action = result.endpoint
                form.method = 'POST'
                Object.entries(result.payload as Record<string, unknown>).forEach(([key, value]) => {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = key
                    input.value = String(value)
                    form.appendChild(input)
                })
                document.body.appendChild(form)
                form.submit()
            } else {
                setError((result as any).error || 'Có lỗi xảy ra khi tạo giao dịch')
                setIsLoading(false)
            }
        } catch (err) {
            console.error(err)
            setError('Có lỗi xảy ra khi kết nối đến server')
            setIsLoading(false)
        }
    }

    // Base coin preview for showing "bonus" comparison
    const baseCoinsForAmount = Math.max(1, Math.floor(amountNum / 1000) * baseRate.coins_per_1000vnd)
    const bonusCoins = previewIsTier ? previewCoins - baseCoinsForAmount : 0

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {searchParams.get('next') ? (
                <Link
                    href={searchParams.get('next') || '/dashboard/coins'}
                    className="inline-flex items-center text-sm text-premium-600 hover:text-premium-900 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại xem không gian
                </Link>
            ) : (
                <Link
                    href="/dashboard/coins"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Quay lại ví của bạn
                </Link>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Coins className="w-6 h-6 text-yellow-500" />
                        Nạp xu vào tài khoản
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Tỷ lệ cơ bản: {(1000).toLocaleString('vi-VN')} VNĐ = {baseRate.coins_per_1000vnd} xu
                        {tiers.length > 0 && ' · Mua nhiều hơn để nhận ưu đãi tốt hơn!'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Promotional Tiers */}
                    {tiers.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5" />
                                Gói ưu đãi
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {tiers.map((tier) => {
                                    const tierBaseCoins = Math.max(1, Math.floor(tier.min_amount_vnd / 1000) * baseRate.coins_per_1000vnd)
                                    const tierBonus = tier.coins_granted - tierBaseCoins
                                    const isSelected = parseInt(amount) === tier.min_amount_vnd
                                    return (
                                        <button
                                            key={tier.id}
                                            onClick={() => setAmount(tier.min_amount_vnd.toString())}
                                            className={`relative text-left px-4 py-3.5 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                                                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {tierBonus > 0 && (
                                                <span className="absolute -top-2 -right-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                                                    <Zap className="w-2.5 h-2.5" />
                                                    +{tierBonus} xu
                                                </span>
                                            )}
                                            <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                                                {tier.label}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {tier.min_amount_vnd.toLocaleString('vi-VN')} VNĐ
                                            </p>
                                            <div className="mt-2 flex items-baseline gap-1">
                                                <span className={`text-lg font-bold ${isSelected ? 'text-indigo-600' : 'text-yellow-600'}`}>
                                                    {tier.coins_granted}
                                                </span>
                                                <span className="text-xs text-gray-500">xu</span>
                                                {tierBonus > 0 && (
                                                    <span className="text-xs text-gray-400 line-through ml-1">
                                                        {tierBaseCoins}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Custom Amount Input */}
                    <div>
                        <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-2">
                            {tiers.length > 0 ? 'Hoặc nhập số tiền tùy chọn' : 'Số tiền muốn nạp'}
                            <span className="text-gray-400 font-normal ml-1">(tối thiểu {minTopup.toLocaleString('vi-VN')}đ)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="custom-amount"
                                min={minTopup}
                                step="1000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-4 pr-14 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                                placeholder="Nhập số tiền..."
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                                VNĐ
                            </span>
                        </div>
                        {amountNum > 0 && amountNum < minTopup && (
                            <p className="mt-2 text-xs text-red-500">
                                Số tiền nạp tối thiểu là {minTopup.toLocaleString('vi-VN')} VNĐ
                            </p>
                        )}
                    </div>

                    {/* Summary */}
                    <div className={`rounded-xl p-4 border transition-colors ${previewIsTier
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                        : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500">Tổng thanh toán</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {amountNum.toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Xu nhận được</p>
                                <div className="flex items-baseline gap-1.5 justify-end">
                                    <p className={`text-lg font-bold ${previewIsTier ? 'text-indigo-600' : 'text-yellow-600'}`}>
                                        {previewCoins.toLocaleString('vi-VN')} xu
                                    </p>
                                    {bonusCoins > 0 && (
                                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                            +{bonusCoins} thưởng
                                        </span>
                                    )}
                                </div>
                                {previewIsTier && bonusCoins > 0 && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Thay vì {baseCoinsForAmount} xu theo tỷ lệ thường
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={isLoading || amountNum < minTopup}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Thanh toán {amountNum > 0 ? `${amountNum.toLocaleString('vi-VN')} VNĐ` : ''}
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-gray-400">
                        Giao dịch được xử lý an toàn bởi SePay. Số dư sẽ được cộng tự động ngay sau khi thanh toán thành công.
                    </p>
                </div>
            </div>
        </div>
    )
}
