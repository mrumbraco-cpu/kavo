'use client'

import React, { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Trash2,
    RefreshCcw,
    ChevronRight,
    Filter,
    MoreVertical,
    X,
    Info
} from 'lucide-react'

interface ErrorLog {
    id: string
    user_id: string | null
    action_type: string
    error_message: string
    error_stack: string | null
    metadata: any
    status: 'new' | 'investigating' | 'resolved' | 'ignored'
    created_at: string
}

const statusColors = {
    new: 'bg-rose-100 text-rose-700 border-rose-200',
    investigating: 'bg-amber-100 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ignored: 'bg-slate-100 text-slate-700 border-slate-200'
}

const actionTypeLabels: Record<string, string> = {
    github_image_upload: 'Tải ảnh lên GitHub',
    github_image_delete: 'Xóa ảnh trên GitHub',
    sepay_webhook_rpc_error: 'Lỗi SePay Webhook (RPC)',
    sepay_webhook_missing_id: 'SePay Webhook (Thiếu ID)',
    sepay_webhook_order_not_found: 'SePay Webhook (Ko tìm thấy đơn)',
    sepay_webhook_missing_user: 'SePay Webhook (Thiếu User)',
    sepay_webhook_logic_error: 'SePay Webhook (Lỗi logic)',
    sepay_webhook_internal_error: 'SePay Webhook (Lỗi server)',
    topup_create_request_error: 'Lỗi tạo yêu cầu nạp tiền',
    topup_verify_order_not_found: 'Xác thực nạp tiền (Ko tìm thấy đơn)',
    topup_verify_ownership_mismatch: 'Xác thực nạp tiền (Sai chủ sở hữu)',
    topup_verify_rpc_error: 'Xác thực nạp tiền (RPC)',
    topup_verify_logic_error: 'Xác thực nạp tiền (Lỗi logic)',
    topup_verify_internal_error: 'Xác thực nạp tiền (Lỗi server)',
    auth_login_error: 'Đăng nhập thất bại',
    auth_register_error: 'Đăng ký thất bại',
    auth_verify_error: 'Xác thực tài khoản thất bại',
    auth_forgot_password_error: 'Quên mật khẩu thất bại',
    auth_reset_password_error: 'Reset mật khẩu thất bại',
    profile_update_error: 'Cập nhật tài khoản thất bại',
    listing_create_error: 'Đăng bài thất bại',
    listing_update_error: 'Sửa bài thất bại',
    listing_toggle_favorite_error: 'Lưu/Bỏ lưu yêu thích thất bại',
    contact_unlock_rpc_exception: 'Lỗi RPC Mở khóa liên hệ',
}

export default function ErrorLogsAdmin() {
    const [logs, setLogs] = useState<ErrorLog[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null)
    const [actionFilter, setActionFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = createBrowserSupabaseClient()

    useEffect(() => {
        fetchLogs()
    }, [actionFilter, statusFilter])

    async function fetchLogs() {
        setLoading(true)
        let query = supabase
            .from('error_logs')
            .select('*')
            .order('created_at', { ascending: false })

        if (actionFilter) query = query.eq('action_type', actionFilter)
        if (statusFilter) query = query.eq('status', statusFilter)

        const { data, error } = await query
        if (error) {
            console.error('Error fetching logs:', error)
        } else {
            setLogs(data || [])
        }
        setLoading(false)
    }

    async function updateStatus(id: string, status: ErrorLog['status']) {
        const { error } = await supabase
            .from('error_logs')
            .update({ status })
            .eq('id', id)

        if (error) {
            alert('Không thể cập nhật trạng thái')
        } else {
            setLogs(logs.map(log => log.id === id ? { ...log, status } : log))
            if (selectedLog?.id === id) setSelectedLog({ ...selectedLog, status })
        }
    }

    async function deleteLog(id: string) {
        if (!confirm('Bạn có chắc chắn muốn xóa log này?')) return

        const { error } = await supabase
            .from('error_logs')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Không thể xóa log')
        } else {
            setLogs(logs.filter(log => log.id !== id))
            if (selectedLog?.id === id) setSelectedLog(null)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchSearch = searchTerm === '' ||
            log.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action_type.toLowerCase().includes(searchTerm.toLowerCase())
        return matchSearch
    })

    // Get unique action types for filter
    const actionTypes = Array.from(new Set(logs.map(l => l.action_type)))

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Error Logs</h1>
                    <p className="text-slate-500 mt-1">Quản lý và theo dõi các lỗi hệ thống phát sinh.</p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Tải lại
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Bộ lọc
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">Tìm kiếm</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm tin nhắn lỗi..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">Hành động</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                >
                                    <option value="">Tất cả hành động</option>
                                    {actionTypes.sort().map(at => (
                                        <option key={at} value={at}>{actionTypeLabels[at] || at}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 block">Trạng thái</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="new">Mới (New)</option>
                                    <option value="investigating">Đang kiểm tra</option>
                                    <option value="resolved">Đã giải quyết</option>
                                    <option value="ignored">Bỏ qua</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800">Thống kê</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                                <p className="text-xs text-rose-600 font-medium">Lỗi mới</p>
                                <p className="text-xl font-bold text-rose-700">{logs.filter(l => l.status === 'new').length}</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium">Đã xử lý</p>
                                <p className="text-xl font-bold text-emerald-700">{logs.filter(l => l.status === 'resolved').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-bottom border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông điệp lỗi</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <RefreshCcw className="w-8 h-8 mx-auto animate-spin mb-2 opacity-20" />
                                                Đang tải danh sách lỗi...
                                            </td>
                                        </tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500/20" />
                                                Không tìm thấy lỗi nào phù hợp bộ lọc.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map(log => (
                                            <tr
                                                key={log.id}
                                                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedLog?.id === log.id ? 'bg-indigo-50/30' : ''}`}
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: vi })}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {format(new Date(log.created_at), 'HH:mm:ss', { locale: vi })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tight">
                                                        {actionTypeLabels[log.action_type] || log.action_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 line-clamp-1 max-w-md" title={log.error_message}>
                                                        {log.error_message}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${statusColors[log.status] || ''}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedLog(log)}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                                        >
                                                            <Info className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteLog(log.id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${statusColors[selectedLog.status]}`}>
                                        {selectedLog.status}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-800">Chi tiết lỗi</h3>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">ID: {selectedLog.id} • {format(new Date(selectedLog.created_at), 'PPPPpppp', { locale: vi })}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <section className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500" />
                                    Thông điệp lỗi
                                </h4>
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                                    <p className="text-rose-900 font-medium whitespace-pre-wrap">{selectedLog.error_message}</p>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hành động & User</h4>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Hành động:</span>
                                            <span className="text-sm font-bold text-slate-700">{actionTypeLabels[selectedLog.action_type] || selectedLog.action_type}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Người thực hiện:</span>
                                            <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{selectedLog.user_id || 'Ẩn danh/Hệ thống'}</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Metadata</h4>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-hidden">
                                        {selectedLog.metadata ? (
                                            <pre className="text-xs text-slate-600 overflow-x-auto max-h-40">
                                                {JSON.stringify(selectedLog.metadata, null, 2)}
                                            </pre>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">Không có dữ liệu mở rộng</span>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {selectedLog.error_stack && (
                                <section className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Stack Trace</h4>
                                    <div className="p-4 bg-slate-900 rounded-xl overflow-hidden shadow-inner">
                                        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre p-2 leading-relaxed opacity-90 hover:opacity-100 transition-opacity">
                                            {selectedLog.error_stack}
                                        </pre>
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap gap-3 bg-slate-50/50">
                            <div className="flex items-center gap-2 mr-auto">
                                <label className="text-sm text-slate-500 font-medium">Cập nhật trạng thái:</label>
                                <div className="flex p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    {(['new', 'investigating', 'resolved', 'ignored'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateStatus(selectedLog.id, s)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedLog.status === s
                                                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                                : 'text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {s.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => deleteLog(selectedLog.id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Xóa log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
