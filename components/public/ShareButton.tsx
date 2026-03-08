'use client';

import { useState } from 'react';


interface ShareButtonProps {
    title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Xem không gian này trên CHOBAN.VN: ${title}`,
                    url: url,
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                    copyToClipboard(url);
                }
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    return (
        <div className="relative">
            <button
                onClick={handleShare}
                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300 active:scale-95 flex items-center justify-center group border border-gray-100"
                title="Chia sẻ tin này"
            >
                {copied ? (
                    <svg className="w-5 h-5 text-emerald-500 animate-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                )}
            </button>

            {copied && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-1">
                    Đã sao chép liên kết!
                </div>
            )}
        </div>
    );
}
