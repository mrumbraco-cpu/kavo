'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Upload, Plus } from 'lucide-react'

interface ImageUploadProps {
    images: string[]
    onImagesChange: (newImages: string[], pendingUploads: File[], pendingDeletions: string[]) => void
    maxImages?: number
}

export default function ImageUpload({ images, onImagesChange, maxImages = 6 }: ImageUploadProps) {
    const [previews, setPreviews] = useState<{ url: string; file?: File; isExisting: boolean }[]>(
        images.map(url => ({ url, isExisting: true }))
    )
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Compress and resize image to max 1920x1920, quality 0.8
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = document.createElement('img')
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')!

                    // Calculate new dimensions (max 1920px on longest side)
                    const MAX_SIZE = 1920
                    let width = img.width
                    let height = img.height

                    if (width > height && width > MAX_SIZE) {
                        height = (height * MAX_SIZE) / width
                        width = MAX_SIZE
                    } else if (height > MAX_SIZE) {
                        width = (width * MAX_SIZE) / height
                        height = MAX_SIZE
                    }

                    canvas.width = width
                    canvas.height = height
                    ctx.drawImage(img, 0, 0, width, height)

                    // Convert to blob with 0.8 quality
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                })
                                resolve(compressedFile)
                            } else {
                                resolve(file) // Fallback to original
                            }
                        },
                        'image/jpeg',
                        0.8
                    )
                }
                img.src = e.target?.result as string
            }
            reader.readAsDataURL(file)
        })
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const remaining = maxImages - previews.length
        const selectedFiles = files.slice(0, remaining)

        // Compress images before creating previews
        const compressedFiles = await Promise.all(selectedFiles.map(compressImage))

        const newPreviews = compressedFiles.map(file => ({
            url: URL.createObjectURL(file),
            file,
            isExisting: false
        }))

        const totalPreviews = [...previews, ...newPreviews]
        setPreviews(totalPreviews)
        notifyChange(totalPreviews)
    }

    const removeImage = (index: number) => {
        const updated = previews.filter((_, i) => i !== index)
        setPreviews(updated)
        notifyChange(updated)
    }

    const notifyChange = (currentPreviews: typeof previews) => {
        const remainingExisting = currentPreviews.filter(p => p.isExisting).map(p => p.url)
        const pendingUploads = currentPreviews.filter(p => !p.isExisting).map(p => p.file!)
        const pendingDeletions = images.filter(url => !remainingExisting.includes(url))

        onImagesChange(remainingExisting, pendingUploads, pendingDeletions)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <Image
                            src={preview.url}
                            alt={`Preview ${index}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {previews.length < maxImages && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors bg-gray-50"
                    >
                        <Plus size={32} />
                        <span className="text-xs mt-2 font-medium">Thêm ảnh ({previews.length}/{maxImages})</span>
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
            />
        </div>
    )
}
