'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
    images: string[];
    title: string;
}

export default function ImageGallery({ images, title }: Props) {
    const [active, setActive] = useState(0);
    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-video bg-premium-100 rounded-2xl flex items-center justify-center">
                <svg className="w-16 h-16 text-premium-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-premium-100">
                <Image
                    src={images[active]}
                    alt={`${title} - ảnh ${active + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    unoptimized
                    priority={active === 0}
                />
                {/* Nav arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setActive(i => (i - 1 + images.length) % images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setActive(i => (i + 1) % images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                        >
                            ›
                        </button>
                    </>
                )}
                {/* Counter */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 text-white text-xs rounded-full">
                    {active + 1} / {images.length}
                </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition cursor-pointer ${i === active ? 'border-premium-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <Image src={src} alt="" fill className="object-cover" sizes="64px" unoptimized />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
