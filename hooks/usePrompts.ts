'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type {
    PromptLibrary,
    PromptLibraryWithModules,
    LibraryModuleWithContent,
    PromptCategoryWithPrompts,
    Prompt,
    ModuleSection,
    UserFavorite
} from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

// Hook to fetch all published prompt libraries
export function usePromptLibraries() {
    const [libraries, setLibraries] = useState<PromptLibrary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchLibraries = async () => {
            try {
                const { data, error } = await supabase
                    .from('prompt_libraries')
                    .select('*')
                    .eq('is_published', true)
                    .order('order_index')

                if (error) throw error
                setLibraries(data || [])
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchLibraries()
    }, [])

    return { libraries, loading, error }
}

// Hook to fetch single library with modules, sections, and prompts
export function usePromptLibrary(slug: string) {
    const [library, setLibrary] = useState<PromptLibraryWithModules | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                // Fetch library
                const { data: libraryData, error: libraryError } = await supabase
                    .from('prompt_libraries')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_published', true)
                    .single()

                if (libraryError) throw libraryError

                // Fetch modules
                const { data: modulesData, error: modulesError } = await supabase
                    .from('library_modules')
                    .select('*')
                    .eq('library_id', libraryData.id)
                    .order('order_index')

                if (modulesError) throw modulesError

                // Fetch sections for all modules
                const { data: sectionsData, error: sectionsError } = await supabase
                    .from('module_sections')
                    .select('*')
                    .in('module_id', modulesData?.map(m => m.id) || [])
                    .order('order_index')

                if (sectionsError) throw sectionsError

                // Fetch categories with prompts for all modules
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('prompt_categories')
                    .select(`
                        *,
                        prompts (*)
                    `)
                    .in('module_id', modulesData?.map(m => m.id) || [])
                    .order('order_index')

                if (categoriesError) throw categoriesError

                // Assemble the modular structure
                const modulesWithContent: LibraryModuleWithContent[] = (modulesData || []).map(module => ({
                    ...module,
                    sections: (sectionsData || [])
                        .filter(s => s.module_id === module.id)
                        .sort((a, b) => a.order_index - b.order_index),
                    categories: (categoriesData || [])
                        .filter(c => c.module_id === module.id)
                        .map(cat => ({
                            ...cat,
                            prompts: (cat.prompts || []).sort((a: Prompt, b: Prompt) => a.order_index - b.order_index)
                        }))
                        .sort((a, b) => a.order_index - b.order_index)
                }))

                setLibrary({
                    ...libraryData,
                    modules: modulesWithContent
                })
            } catch (err) {
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchLibrary()
        }
    }, [slug])

    return { library, loading, error }
}

// Hook for managing user favorites
export function useFavorites() {
    const { user } = useAuth()
    const [favorites, setFavorites] = useState<string[]>([]) // Array of prompt_ids
    const [loading, setLoading] = useState(true)

    // Fetch user's favorites
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setFavorites([])
                setLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('user_favorites')
                    .select('prompt_id')
                    .eq('user_id', user.id)

                if (error) throw error
                setFavorites(data?.map(f => f.prompt_id) || [])
            } catch (err) {
                console.error('Error fetching favorites:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchFavorites()
    }, [user])

    // Add to favorites
    const addFavorite = useCallback(async (promptId: string) => {
        console.log('addFavorite called with promptId:', promptId, 'user:', user?.id)
        if (!user) {
            console.log('No user, returning error')
            return { error: new Error('Not authenticated') }
        }

        try {
            console.log('Inserting favorite...')
            const { error } = await supabase
                .from('user_favorites')
                .insert({ user_id: user.id, prompt_id: promptId })

            if (error) {
                console.error('Error inserting favorite:', error)
                throw error
            }
            console.log('Favorite added successfully!')
            setFavorites(prev => [...prev, promptId])
            return { error: null }
        } catch (err) {
            console.error('Exception in addFavorite:', err)
            return { error: err as Error }
        }
    }, [user])

    // Remove from favorites
    const removeFavorite = useCallback(async (promptId: string) => {
        if (!user) return { error: new Error('Not authenticated') }

        try {
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('prompt_id', promptId)

            if (error) throw error
            setFavorites(prev => prev.filter(id => id !== promptId))
            return { error: null }
        } catch (err) {
            return { error: err as Error }
        }
    }, [user])

    // Toggle favorite
    const toggleFavorite = useCallback(async (promptId: string) => {
        if (favorites.includes(promptId)) {
            return removeFavorite(promptId)
        } else {
            return addFavorite(promptId)
        }
    }, [favorites, addFavorite, removeFavorite])

    // Check if prompt is favorite
    const isFavorite = useCallback((promptId: string) => {
        return favorites.includes(promptId)
    }, [favorites])

    return { favorites, loading, addFavorite, removeFavorite, toggleFavorite, isFavorite }
}
