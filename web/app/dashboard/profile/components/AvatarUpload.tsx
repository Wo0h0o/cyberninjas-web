'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { resizeImage, validateImageFile, getFileExtension } from '@/lib/imageUtils'
import { useAchievements } from '@/hooks/useAchievements'

interface AvatarUploadProps {
    currentAvatar?: string
    userId: string
    onUploadSuccess: (avatarUrl: string) => void
    onUploadError: (error: string) => void
}

export function AvatarUpload({
    currentAvatar,
    userId,
    onUploadSuccess,
    onUploadError
}: AvatarUploadProps) {
    const { checkAchievement } = useAchievements()
    const [preview, setPreview] = useState<string | null>(currentAvatar || null)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
            onUploadError(validation.error || 'Invalid file')
            return
        }

        setSelectedFile(file)

        // Show preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    async function handleUpload() {
        if (!selectedFile) return

        setUploading(true)

        try {
            // 1. Resize image
            const resizedBlob = await resizeImage(selectedFile, 256, 256)

            // 2. Get file extension
            const ext = getFileExtension(selectedFile.type)
            const fileName = `${userId}/avatar.${ext}`

            // 3. Delete old avatar if exists (different extension)
            if (currentAvatar) {
                try {
                    const oldPath = currentAvatar.split('/').slice(-2).join('/')
                    await supabase.storage.from('avatars').remove([oldPath])
                } catch (err) {
                    console.warn('Could not delete old avatar:', err)
                }
            }

            // 4. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, resizedBlob, {
                    upsert: true,
                    contentType: selectedFile.type
                })

            if (uploadError) throw uploadError

            // 5. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // 6. Update profile in database
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl } as any)
                .eq('id', userId)

            if (updateError) throw updateError

            // Success! Check First Impression achievement if this is first avatar
            if (!currentAvatar) {
                await checkAchievement('first_impression', {
                    hasAvatar: true
                })
            }

            onUploadSuccess(publicUrl)
            setSelectedFile(null)
        } catch (err: any) {
            console.error('Upload error:', err)
            onUploadError(err.message || 'Грешка при качване. Опитай отново.')
        } finally {
            setUploading(false)
        }
    }

    function handleRemove() {
        setPreview(currentAvatar || null)
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-accent-yellow to-accent-yellow-hover flex items-center justify-center">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-4xl font-bold text-white">
                            {/* Placeholder initials */}
                            ?
                        </span>
                    )}
                </div>

                {/* Upload Status Badge */}
                {selectedFile && !uploading && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                        <Check className="w-5 h-5 text-white" />
                    </motion.div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
                {!selectedFile ? (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 rounded-lg bg-accent-yellow text-text-on-yellow font-medium hover:bg-accent-yellow-hover transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        Избери снимка
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Качване...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Качи
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={uploading}
                            className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Отказ
                        </button>
                    </>
                )}
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
                JPG, PNG или WebP • Макс 2MB
            </p>
        </div>
    )
}
