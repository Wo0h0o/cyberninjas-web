'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CourseRatingProps {
    courseId: string
    currentRating?: number // User's existing rating
    onRatingSubmit?: (rating: number) => void
}

export function CourseRating({ courseId, currentRating, onRatingSubmit }: CourseRatingProps) {
    const { user } = useAuth()
    const [rating, setRating] = useState(currentRating || 0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRatingClick = async (newRating: number) => {
        if (!user) {
            setError('Трябва да сте влезли в акаунта си')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Upsert the rating (insert or update)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: upsertError } = await (supabase
                .from('course_ratings') as any)
                .upsert({
                    user_id: user.id,
                    course_id: courseId,
                    rating: newRating,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,course_id'
                })

            if (upsertError) {
                if (upsertError.message.includes('policy')) {
                    setError('Само закупилите курса могат да оценяват')
                } else {
                    throw upsertError
                }
                return
            }

            setRating(newRating)
            setSuccess(true)
            onRatingSubmit?.(newRating)

            // Hide success message after 2 seconds
            setTimeout(() => setSuccess(false), 2000)
        } catch (err) {
            console.error('Rating error:', err)
            setError('Възникна грешка при оценяването')
        } finally {
            setLoading(false)
        }
    }

    const displayRating = hoveredRating || rating

    return (
        <div className="space-y-2">
            <p className="text-sm text-gray-400">
                {currentRating ? 'Вашата оценка:' : 'Оценете курса:'}
            </p>

            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        type="button"
                        disabled={loading}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-1 transition-colors disabled:opacity-50 ${star <= displayRating ? 'text-accent-yellow' : 'text-gray-600'
                            }`}
                    >
                        <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </motion.button>
                ))}
            </div>

            {loading && (
                <p className="text-sm text-gray-500">Запазване...</p>
            )}

            {success && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-400"
                >
                    ✓ Оценката е записана!
                </motion.p>
            )}

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </div>
    )
}
