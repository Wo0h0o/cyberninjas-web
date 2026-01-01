'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CourseRating {
    id: string
    user_id: string
    course_id: string
    rating: number
    review: string | null
    created_at: string
}

export function useCourseRating(courseId: string) {
    const { user } = useAuth()
    const [userRating, setUserRating] = useState<CourseRating | null>(null)
    const [canRate, setCanRate] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRatingData() {
            if (!user || !courseId) {
                setLoading(false)
                return
            }

            try {
                // Check if user has purchased the course
                const { data: purchase, error: purchaseError } = await supabase
                    .from('purchases')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('course_id', courseId)
                    .single()

                if (purchaseError && purchaseError.code !== 'PGRST116') {
                    console.error('Error checking purchase:', purchaseError)
                }

                setCanRate(!!purchase)

                // Fetch user's existing rating
                const { data: rating, error: ratingError } = await supabase
                    .from('course_ratings')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('course_id', courseId)
                    .single()

                if (ratingError && ratingError.code !== 'PGRST116') {
                    console.error('Error fetching rating:', ratingError)
                }

                setUserRating(rating || null)
            } catch (err) {
                console.error('Error in useCourseRating:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchRatingData()
    }, [user, courseId])

    const submitRating = async (rating: number, review?: string) => {
        if (!user || !canRate) return { error: 'Cannot rate' }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase
            .from('course_ratings') as any)
            .upsert({
                user_id: user.id,
                course_id: courseId,
                rating,
                review: review || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,course_id'
            })

        if (!error) {
            setUserRating(prev => prev
                ? { ...prev, rating, review: review || null }
                : { id: '', user_id: user.id, course_id: courseId, rating, review: review || null, created_at: new Date().toISOString() }
            )
        }

        return { error }
    }

    return {
        userRating,
        canRate,
        loading,
        submitRating
    }
}
