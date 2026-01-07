'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Types for skill tree data
export interface SkillTreeSection {
    id: string
    title: string
    content: string
    order_index: number
}

export interface SkillTreeTakeaway {
    id: string
    takeaway: string
    order_index: number
}

export interface SkillTreeModule {
    id: string
    slug: string
    parent_id: string | null
    title: string
    subtitle: string | null
    icon: string | null
    duration: string | null
    xp_reward: number
    intro: string | null
    order_index: number
    is_published: boolean
    sections?: SkillTreeSection[]
    keyTakeaways?: SkillTreeTakeaway[]
    children?: SkillTreeModule[]
}

export interface UserSkillTreeProgress {
    module_id: string
    is_completed: boolean
    completed_at: string | null
    xp_earned: number
}

/**
 * Hook to fetch all root skill tree modules (trunk)
 */
export function useSkillTreeModules() {
    const [modules, setModules] = useState<SkillTreeModule[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchModules() {
            try {
                const { data, error } = await supabase
                    .from('skill_tree_modules')
                    .select('*')
                    .is('parent_id', null) // Only root modules
                    .eq('is_published', true)
                    .order('order_index')

                if (error) throw error
                setModules(data || [])
            } catch (err) {
                console.error('Error fetching skill tree modules:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch modules')
            } finally {
                setLoading(false)
            }
        }

        fetchModules()
    }, [])

    return { modules, loading, error }
}

/**
 * Hook to fetch a single module with its content (sections, takeaways)
 */
export function useSkillTreeModule(slug: string) {
    const [module, setModule] = useState<SkillTreeModule | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchModule() {
            if (!slug) {
                setLoading(false)
                return
            }

            try {
                // Fetch module
                const { data: moduleData, error: moduleError } = await supabase
                    .from('skill_tree_modules')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_published', true)
                    .single()

                if (moduleError) throw moduleError

                // Fetch sections
                const { data: sections, error: sectionsError } = await supabase
                    .from('skill_tree_sections')
                    .select('*')
                    .eq('module_id', moduleData.id)
                    .order('order_index')

                if (sectionsError) throw sectionsError

                // Fetch takeaways
                const { data: takeaways, error: takeawaysError } = await supabase
                    .from('skill_tree_takeaways')
                    .select('*')
                    .eq('module_id', moduleData.id)
                    .order('order_index')

                if (takeawaysError) throw takeawaysError

                // Fetch children (for future branching)
                const { data: children, error: childrenError } = await supabase
                    .from('skill_tree_modules')
                    .select('*')
                    .eq('parent_id', moduleData.id)
                    .eq('is_published', true)
                    .order('order_index')

                if (childrenError) throw childrenError

                setModule({
                    ...moduleData,
                    sections: sections || [],
                    keyTakeaways: takeaways || [],
                    children: children || []
                })
            } catch (err) {
                console.error('Error fetching skill tree module:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch module')
            } finally {
                setLoading(false)
            }
        }

        fetchModule()
    }, [slug])

    return { module, loading, error }
}

/**
 * Hook to manage user progress on skill tree
 */
export function useSkillTreeProgress() {
    const [progress, setProgress] = useState<Record<string, UserSkillTreeProgress>>({})
    const [loading, setLoading] = useState(true)

    // Fetch user progress
    useEffect(() => {
        async function fetchProgress() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setLoading(false)
                    return
                }

                const { data, error } = await supabase
                    .from('user_skill_tree_progress')
                    .select('*')
                    .eq('user_id', user.id)

                if (error) throw error

                const progressMap: Record<string, UserSkillTreeProgress> = {}
                data?.forEach(p => {
                    progressMap[p.module_id] = p
                })
                setProgress(progressMap)
            } catch (err) {
                console.error('Error fetching skill tree progress:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProgress()
    }, [])

    // Mark module as complete
    const completeModule = useCallback(async (moduleId: string, xpReward: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('user_skill_tree_progress')
                .upsert({
                    user_id: user.id,
                    module_id: moduleId,
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                    xp_earned: xpReward
                }, {
                    onConflict: 'user_id,module_id'
                })
                .select()
                .single()

            if (error) throw error

            setProgress(prev => ({
                ...prev,
                [moduleId]: data
            }))

            return { success: true, data }
        } catch (err) {
            console.error('Error completing module:', err)
            return { success: false, error: err instanceof Error ? err.message : 'Failed to complete module' }
        }
    }, [])

    // Check if module is completed
    const isModuleCompleted = useCallback((moduleId: string) => {
        return progress[moduleId]?.is_completed || false
    }, [progress])

    return { progress, loading, completeModule, isModuleCompleted }
}

/**
 * Utility function to build tree structure from flat modules
 */
export function buildModuleTree(modules: SkillTreeModule[]): SkillTreeModule[] {
    const moduleMap = new Map<string, SkillTreeModule>()
    const roots: SkillTreeModule[] = []

    // First pass: create map
    modules.forEach(m => {
        moduleMap.set(m.id, { ...m, children: [] })
    })

    // Second pass: build tree
    modules.forEach(m => {
        const module = moduleMap.get(m.id)!
        if (m.parent_id && moduleMap.has(m.parent_id)) {
            moduleMap.get(m.parent_id)!.children!.push(module)
        } else {
            roots.push(module)
        }
    })

    return roots
}
