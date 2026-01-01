'use client'

import { useState, useRef } from 'react'
import { clsx } from 'clsx'
import { uploadImage } from '@/lib/uploadImage'

interface ImageUploadProps {
    value: string | null
    onChange: (url: string | null) => void
    folder?: string
    className?: string
}

export function ImageUpload({ value, onChange, folder = 'modules', className }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Моля, качете изображение')
            return
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Изображението е твърде голямо (макс 5MB)')
            return
        }

        setUploading(true)
        try {
            const url = await uploadImage(file, 'library-images', folder)
            if (url) {
                onChange(url)
            } else {
                alert('Грешка при качване')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Грешка при качване')
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUpload(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleUpload(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {value ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 group">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                        >
                            Смени
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                        >
                            Премахни
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={clsx(
                        'w-full h-32 rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2',
                        dragOver
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/10 hover:border-white/30 bg-white/[0.02]',
                        uploading && 'opacity-50 cursor-wait'
                    )}
                >
                    {uploading ? (
                        <>
                            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-400">Качване...</span>
                        </>
                    ) : (
                        <>
                            <svg
                                className="text-gray-500"
                                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span className="text-sm text-gray-400">
                                Кликни или пусни изображение
                            </span>
                            <span className="text-xs text-gray-500">PNG, JPG до 5MB • Препоръчително: 750×300px</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
