'use client'

import { useActionState, useState, useTransition } from 'react'
import { updateBaseRate, createTier, updateTier, deleteTier, toggleTier } from './actions'
import { Coins, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Check, AlertCircle, Zap, X } from 'lucide-react'

interface Config {
    id: number
    coins_per_1000vnd: number
    min_topup_vnd: number
    updated_at: string
}

interface Tier {
    id: string
    label: string
    min_amount_vnd: number
    coins_granted: number
    is_active: boolean
    display_order: number
    created_at: string
}

interface Props {
    config: Config | null
    tiers: Tier[]
}

function StatusAlert({ state }: { state: { success?: boolean; error?: string } | null }) {
    if (!state) return null
    if (state.success) return (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            <Check className="w-4 h-4 flex-shrink-0" /> Đã lưu thành công
        </div>
    )
    if (state.error) return (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {state.error}
        </div>
    )
    return null
}

function TierFormModal({
    tier,
    onClose,
}: {
    tier?: Tier | null
    onClose: () => void
}) {
    const action = tier ? updateTier : createTier
    const [state, formAction, isPending] = useActionState(action, null)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">
                        {tier ? 'Chỉnh sửa gói' : 'Thêm gói mới'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form action={formAction} className="p-6 space-y-4">
                    {tier && <input type="hidden" name="id" value={tier.id} />}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói</label>
                        <input
                            name="label"
                            required
                            defaultValue={tier?.label}
                            placeholder="VD: Gói Bạc"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nạp tối thiểu (VNĐ)</label>
                            <input
                                name="min_amount_vnd"
                                type="number"
                                required
                                min="1000"
                                step="1000"
                                defaultValue={tier?.min_amount_vnd}
                                placeholder="50000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xu nhận được</label>
                            <input
                                name="coins_granted"
                                type="number"
                                required
                                min="1"
                                defaultValue={tier?.coins_granted}
                                placeholder="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                        <input
                            name="display_order"
                            type="number"
                            defaultValue={tier?.display_order ?? 0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <StatusAlert state={state as any} />
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {isPending ? 'Đang lưu...' : (tier ? 'Lưu thay đổi' : 'Tạo gói')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function CoinsAdminClient({ config, tiers: initialTiers }: Props) {
    const [baseRateState, baseRateAction, isBaseRatePending] = useActionState(updateBaseRate, null)
    const [editingTier, setEditingTier] = useState<Tier | null | undefined>(undefined) // undefined = closed, null = new
    const [isPending, startTransition] = useTransition()

    const handleDelete = (id: string) => {
        if (!confirm('Xóa gói này?')) return
        startTransition(async () => {
            await deleteTier(id)
        })
    }

    const handleToggle = (id: string, current: boolean) => {
        startTransition(async () => {
            await toggleTier(id, !current)
        })
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Coins className="w-7 h-7 text-yellow-500" />
                    Cài đặt xu
                </h1>
                <p className="mt-1 text-sm text-gray-500">Quản lý tỷ lệ quy đổi và các gói ưu đãi nạp xu.</p>
            </div>

            {/* Base Rate Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-semibold text-gray-900 text-sm">Tỷ lệ quy đổi cơ bản</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Áp dụng khi không khớp gói ưu đãi nào.</p>
                </div>
                <form action={baseRateAction} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Xu nhận được / 1.000 VNĐ
                            </label>
                            <div className="relative">
                                <input
                                    name="coins_per_1000vnd"
                                    type="number"
                                    required
                                    min="1"
                                    defaultValue={config?.coins_per_1000vnd ?? 1}
                                    className="w-full pl-4 pr-14 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">xu</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số tiền nạp tối thiểu (VNĐ)
                            </label>
                            <div className="relative">
                                <input
                                    name="min_topup_vnd"
                                    type="number"
                                    required
                                    min="1000"
                                    step="1000"
                                    defaultValue={config?.min_topup_vnd ?? 10000}
                                    className="w-full pl-4 pr-14 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">VNĐ</span>
                            </div>
                        </div>
                    </div>
                    <StatusAlert state={baseRateState as any} />
                    <div className="flex items-center justify-between">
                        {config?.updated_at && (
                            <p className="text-xs text-gray-400">
                                Cập nhật: {new Date(config.updated_at).toLocaleString('vi-VN')}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={isBaseRatePending}
                            className="ml-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {isBaseRatePending ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tiers Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-orange-400" />
                            Gói ưu đãi
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Tier cao nhất phù hợp với số tiền nạp sẽ được áp dụng.
                        </p>
                    </div>
                    <button
                        onClick={() => setEditingTier(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm gói
                    </button>
                </div>

                {initialTiers.length === 0 ? (
                    <div className="px-6 py-10 text-center text-gray-400 text-sm">
                        Chưa có gói ưu đãi nào. Nhấn "Thêm gói" để tạo mới.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {initialTiers.map((tier) => (
                            <div
                                key={tier.id}
                                className={`flex items-center gap-4 px-6 py-4 transition-colors ${tier.is_active ? '' : 'opacity-50 bg-gray-50'}`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-gray-900 truncate">{tier.label}</span>
                                        {!tier.is_active && (
                                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Tắt</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Nạp ≥ {tier.min_amount_vnd.toLocaleString('vi-VN')} VNĐ →{' '}
                                        <span className="font-semibold text-yellow-600">{tier.coins_granted} xu</span>
                                        {' · '}Thứ tự: {tier.display_order}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggle(tier.id, tier.is_active)}
                                        disabled={isPending}
                                        title={tier.is_active ? 'Tắt gói' : 'Bật gói'}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 transition rounded-lg hover:bg-indigo-50"
                                    >
                                        {tier.is_active ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => setEditingTier(tier)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 transition rounded-lg hover:bg-indigo-50"
                                        title="Chỉnh sửa"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tier.id)}
                                        disabled={isPending}
                                        className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {editingTier !== undefined && (
                <TierFormModal
                    tier={editingTier}
                    onClose={() => setEditingTier(undefined)}
                />
            )}
        </div>
    )
}
