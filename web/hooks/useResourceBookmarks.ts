import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAchievements } from './useAchievements'

export function useResourceBookmarks() {
    const { user } = useAuth()
    const { checkAchievement } = useAchievements()
    const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(new Set())
    const [bookmarkCount, setBookmarkCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch user's bookmarks on mount
    useEffect(() => {
        if (user) {
            fetchBookmarks()
        } else {
            setLoading(false)
        }
    }, [user])

    async function fetchBookmarks() {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('resource_bookmarks')
                .select('resource_id')
                .eq('user_id', user.id)

            if (error) throw error

            const resourceIds = new Set(data?.map(b => b.resource_id) || [])
            setBookmarkedResources(resourceIds)
            setBookmarkCount(resourceIds.size)
        } catch (error) {
            console.error('Error fetching bookmarks:', error)
        } finally {
            setLoading(false)
        }
    }

    // Check if resource is bookmarked
    function isBookmarked(resourceId: string): boolean {
        return bookmarkedResources.has(resourceId)
    }

    // Toggle bookmark for a resource
    async function toggleBookmark(resourceId: string): Promise<boolean> {
        if (!user) return false

        const wasBookmarked = isBookmarked(resourceId)

        try {
            if (wasBookmarked) {
                // Remove bookmark
                const { error } = await supabase
                    .from('resource_bookmarks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('resource_id', resourceId)

                if (error) throw error

                // Update local state
                const newBookmarks = new Set(bookmarkedResources)
                newBookmarks.delete(resourceId)
                setBookmarkedResources(newBookmarks)
                setBookmarkCount(newBookmarks.size)

                return false
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from('resource_bookmarks')
                    .insert({
                        user_id: user.id,
                        resource_id: resourceId
                    })

                if (error) throw error

                // Update local state
                const newBookmarks = new Set(bookmarkedResources)
                newBookmarks.add(resourceId)
                setBookmarkedResources(newBookmarks)
                const newCount = newBookmarks.size
                setBookmarkCount(newCount)

                // Check achievements after adding bookmark
                await checkAchievements(newCount)

                return true
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error)
            return wasBookmarked
        }
    }

    // Check bookmark achievements
    async function checkAchievements(count: number) {
        // Bookworm - First bookmark
        if (count === 1) {
            await checkAchievement('bookworm', {
                resourceBookmarks: count
            })
        }
        // Collector - 10 bookmarks
        else if (count === 10) {
            await checkAchievement('collector', {
                resourceBookmarks: count
            })
        }
        // Curator - 50 bookmarks
        else if (count === 50) {
            await checkAchievement('curator', {
                resourceBookmarks: count
            })
        }
    }

    // Get all bookmarked resources with full data
    async function getBookmarkedResources() {
        if (!user) return []

        try {
            const { data, error } = await supabase
                .from('resource_bookmarks')
                .select(`
                    resource_id,
                    created_at,
                    resources (*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Error fetching bookmarked resources:', error)
            return []
        }
    }

    return {
        isBookmarked,
        toggleBookmark,
        bookmarkCount,
        loading,
        getBookmarkedResources,
        refreshBookmarks: fetchBookmarks
    }
}
