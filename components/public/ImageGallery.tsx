'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
    images: string[];
    title: string;
}

export default function ImageGallery({ images, title }: Props) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = (i: number) => setLightboxIndex(i);
    const closeLightbox = () => setLightboxIndex(null);
    const prevPhoto = () => setLightboxIndex(i => (i! - 1 + images.length) % images.length);
    const nextPhoto = () => setLightboxIndex(i => (i! + 1) % images.length);

    if (!images || images.length === 0) {
        return null;
    }

    const hasMultiple = images.length > 1;

    return (
        <>
            {/* Airbnb-style grid */}
            <div className="relative rounded-2xl overflow-hidden">
                {/* Grid layout */}
                {images.length === 1 ? (
                    <div
                        className="relative w-full aspect-[16/7] cursor-pointer"
                        onClick={() => openLightbox(0)}
                    >
                        <Image src={images[0]} alt={title} fill className="object-cover" sizes="100vw" unoptimized priority />
                    </div>
                ) : images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-2 aspect-[16/7]">
                        {images.slice(0, 2).map((src, i) => (
                            <div key={i} className="relative cursor-pointer overflow-hidden" onClick={() => openLightbox(i)}>
                                <Image src={src} alt={`${title} ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="50vw" unoptimized priority={i === 0} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 grid-rows-2 gap-2 aspect-[16/7]">
                        {/* Main large image */}
                        <div
                            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden"
                            onClick={() => openLightbox(0)}
                        >
                            <Image src={images[0]} alt={title} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="50vw" unoptimized priority />
                        </div>
                        {/* Side images */}
                        {images.slice(1, 5).map((src, i) => (
                            <div
                                key={i}
                                className="relative cursor-pointer overflow-hidden"
                                onClick={() => openLightbox(i + 1)}
                            >
                                <Image
                                    src={src}
                                    alt={`${title} ${i + 2}`}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                    sizes="25vw"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* "Show all photos" button */}
                {hasMultiple && (
                    <button
                        onClick={() => openLightbox(0)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Xem tất cả {images.length} ảnh
                    </button>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition cursor-pointer z-10"
                        onClick={closeLightbox}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
                        {lightboxIndex + 1} / {images.length}
                    </div>

                    {/* Image */}
                    <div
                        className="relative w-full max-w-5xl h-[80vh] mx-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={images[lightboxIndex]}
                            alt={`${title} ${lightboxIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            unoptimized
                        />
                    </div>

                    {/* Left/Right nav */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl transition cursor-pointer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl transition cursor-pointer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
