'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { REPORT_REASONS } from '@/lib/constants/report-reasons';
import { submitReportAction } from '@/app/(public)/listings/[slug]/actions';

interface ReportButtonProps {
    listingId: string;
    isAuthenticated: boolean;
}

export default function ReportButton({ listingId, isAuthenticated }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState<string>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) return;
        if (!reason) {
            setError('Vui lòng chọn lý do báo cáo.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await submitReportAction(listingId, reason, description);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                    setReason('');
                    setDescription('');
                }, 3000);
            } else {
                setError(result.error || 'Đã xảy ra lỗi.');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi hệ thống.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpen = () => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để thực hiện báo cáo.');
            return;
        }
        setIsOpen(true);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider font-semibold"
                title="Báo cáo tin này"
            >
                <Flag className="w-3.5 h-3.5" />
                Báo cáo
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => !isSubmitting && setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Báo cáo tin đăng
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isSubmitting}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[85vh]">
                            {success ? (
                                <div className="text-center py-8 animate-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Đã gửi báo cáo!</h4>
                                    <p className="text-sm text-gray-500">
                                        Cảm ơn bạn đã đóng góp. Chúng tôi sẽ xem xét báo cáo này sớm nhất có thể.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            Lý do báo cáo
                                        </label>
                                        <div className="space-y-2">
                                            {REPORT_REASONS.map((r) => (
                                                <label
                                                    key={r.value}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${reason === r.value
                                                        ? 'border-red-200 bg-red-50 text-red-900'
                                                        : 'border-gray-100 hover:border-gray-300 text-gray-600'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="reason"
                                                        value={r.value}
                                                        checked={reason === r.value}
                                                        onChange={(e) => setReason(e.target.value)}
                                                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                                                    />
                                                    <span className="text-sm font-medium">{r.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                            Mô tả thêm (tùy chọn)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Cung cấp thêm chi tiết để giúp chúng tôi xử lý nhanh hơn…"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[100px] resize-none"
                                            maxLength={1000}
                                        />
                                        <div className="text-[10px] text-gray-400 mt-1 text-right">
                                            {description.length}/1000
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !reason}
                                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Đang gửi…
                                                </>
                                            ) : (
                                                'Gửi báo cáo'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
