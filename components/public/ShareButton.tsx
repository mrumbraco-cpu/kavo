'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

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
                    text: `Xem không gian này trên SPSHARE: ${title}`,
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
                    <Check className="w-5 h-5 text-emerald-500 animate-in zoom-in duration-300" />
                ) : (
                    <Share2 className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
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
