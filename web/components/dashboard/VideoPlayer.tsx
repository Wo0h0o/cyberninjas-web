'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface VideoPlayerProps {
    url: string | null
    title: string
    onProgress?: (seconds: number) => void
    onComplete?: () => void
    initialPosition?: number
}

export function VideoPlayer({
    url,
    title,
    onProgress,
    onComplete,
    initialPosition = 0
}: VideoPlayerProps) {
    const [isLoading, setIsLoading] = useState(true)

    // Detect video type
    const getEmbedUrl = (videoUrl: string): string => {
        // YouTube
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1]
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`
            }
        }

        // Vimeo
        if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
            if (videoId) {
                return `https://player.vimeo.com/video/${videoId}?autoplay=0`
            }
        }

        // Direct URL - assume it's embeddable
        return videoUrl
    }

    if (!url) {
        return (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-accent-yellow/20 flex items-center justify-center mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent-yellow">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm">Видеото скоро ще бъде налично</p>
                </div>
            </div>
        )
    }

    const embedUrl = getEmbedUrl(url)

    return (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
            {/* Loading State */}
            {isLoading && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-white/[0.03]"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isLoading ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            className="w-12 h-12 border-2 border-accent-yellow border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <p className="text-gray-400 text-sm">Зареждане...</p>
                    </div>
                </motion.div>
            )}

            {/* Video Iframe */}
            <iframe
                src={embedUrl}
                title={title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
            />
        </div>
    )
}
