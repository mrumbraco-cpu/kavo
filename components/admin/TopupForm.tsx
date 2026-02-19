'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/types/profile'
import { topupUserCoins } from '@/app/admin/topup/actions'
import { Search, Coins, AlertCircle, CheckCircle } from 'lucide-react'



interface TopupFormProps {
    users: Pick<Profile, 'id' | 'email' | 'coin_balance'>[]
    initialUserId?: string | null
}

export default function TopupForm({ users, initialUserId }: TopupFormProps) {
    const router = useRouter()
    const [selectedUserId, setSelectedUserId] = useState('')
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Handle initial user from URL
    useEffect(() => {
        if (initialUserId) {
            const user = users.find(u => u.id === initialUserId)
            if (user) {
                setSelectedUserId(user.id)
                setSearchTerm('')
            }
        }
    }, [initialUserId, users])

    // Update URL when user selection changes (optional, but good for consistency)
    useEffect(() => {
        const url = new URL(window.location.href)
        if (selectedUserId) {
            url.searchParams.set('userId', selectedUserId)
        } else {
            url.searchParams.delete('userId')
        }
        window.history.replaceState({}, '', url.toString())
    }, [selectedUserId])

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedUser = users.find(u => u.id === selectedUserId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            const params: { userId: string; amount: number; note?: string } = {
                userId: selectedUserId,
                amount: parseInt(amount, 10),
            }
            if (note) {
                params.note = note
            }
            const result = await topupUserCoins(params)


            if (result.success) {
                setMessage({ type: 'success', text: result.message })
                setSelectedUserId('')
                setAmount('')
                setNote('')
                setSearchTerm('')
                router.refresh()
            } else {
                setMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xử lý yêu cầu' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Selection */}
                <div>
                    <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn người dùng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={selectedUserId ? "Đã chọn người dùng" : "Tìm kiếm email..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!!selectedUserId}
                            className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedUserId ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''
                                }`}
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                            {filteredUsers.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500 text-center">Không tìm thấy người dùng</p>
                            ) : (
                                filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedUserId(user.id)
                                            setSearchTerm('')
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                                <p className="text-xs text-gray-500 font-mono">ID: {user.id.slice(0, 12)}...</p>
                                            </div>
                                            <span className="text-sm font-semibold text-yellow-700">
                                                {user.coin_balance.toLocaleString('vi-VN')} xu
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                    {selectedUser && (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in zoom-in duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-900">{selectedUser.email}</p>
                                        {initialUserId === selectedUser.id && (
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Mục tiêu</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Số dư hiện tại: <span className="font-bold text-yellow-700">
                                            {selectedUser.coin_balance.toLocaleString('vi-VN')} xu
                                        </span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUserId('')}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-bold px-3 py-1 rounded-lg hover:bg-blue-100/50 transition-colors"
                                >
                                    Thay đổi
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Số xu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số xu (số dương để cộng, số âm để trừ)"
                            required
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Nhập số dương để nạp xu, số âm để trừ xu
                    </p>
                    {selectedUser && amount && (
                        <p className="mt-2 text-sm font-medium text-gray-700">
                            Số dư sau giao dịch: <span className="text-yellow-700 font-bold">
                                {(selectedUser.coin_balance + parseInt(amount || '0', 10)).toLocaleString('vi-VN')} xu
                            </span>
                        </p>
                    )}
                </div>

                {/* Note */}
                <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú (tùy chọn)
                    </label>
                    <textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Lý do điều chỉnh số dư..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {message.text}
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !selectedUserId || !amount}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                    {isLoading ? 'Đang xử lý...' : 'Xác nhận điều chỉnh'}
                </button>
            </form>
        </div>
    )
}
