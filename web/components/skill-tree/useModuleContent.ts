'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MODULE_CONTENT_BG } from './ModuleContentBG'

// Types
export interface ModuleSection {
    title: string
    content: string
}

export interface ModuleContent {
    duration: string
    intro: string
    sections: ModuleSection[]
    keyTakeaways: string[]
}

interface SupabaseSection {
    id: string
    title: string
    content: string
    order_index: number
}

interface SupabaseTakeaway {
    id: string
    takeaway: string
    order_index: number
}

/**
 * Hook to get module content - tries Supabase first, falls back to static content
 */
export function useModuleContent(moduleSlug: string) {
    const [content, setContent] = useState<ModuleContent | null>(null)
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<'supabase' | 'static'>('static')

    useEffect(() => {
        async function fetchContent() {
            if (!moduleSlug) {
                setLoading(false)
                return
            }

            try {
                // Try to fetch from Supabase
                const { data: moduleData, error: moduleError } = await supabase
                    .from('skill_tree_modules')
                    .select('id, slug, duration, intro')
                    .eq('slug', moduleSlug)
                    .single()

                if (moduleError || !moduleData) {
                    // Fall back to static content
                    const staticContent = MODULE_CONTENT_BG[moduleSlug]
                    if (staticContent) {
                        setContent(staticContent)
                        setSource('static')
                    }
                    setLoading(false)
                    return
                }

                // Fetch sections
                const { data: sections } = await supabase
                    .from('skill_tree_sections')
                    .select('*')
                    .eq('module_id', moduleData.id)
                    .order('order_index')

                // Fetch takeaways
                const { data: takeaways } = await supabase
                    .from('skill_tree_takeaways')
                    .select('*')
                    .eq('module_id', moduleData.id)
                    .order('order_index')

                // Transform to expected format
                const transformedContent: ModuleContent = {
                    duration: moduleData.duration || '~30 мин',
                    intro: moduleData.intro || '',
                    sections: (sections as SupabaseSection[] || []).map(s => ({
                        title: s.title,
                        content: s.content
                    })),
                    keyTakeaways: (takeaways as SupabaseTakeaway[] || []).map(t => t.takeaway)
                }

                setContent(transformedContent)
                setSource('supabase')
            } catch (err) {
                console.warn('Supabase fetch failed, using static content:', err)
                // Fall back to static content
                const staticContent = MODULE_CONTENT_BG[moduleSlug]
                if (staticContent) {
                    setContent(staticContent)
                    setSource('static')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchContent()
    }, [moduleSlug])

    return { content, loading, source }
}

/**
 * Synchronous getter for static content (for SSR or immediate use)
 */
export function getStaticModuleContent(moduleSlug: string): ModuleContent | null {
    return MODULE_CONTENT_BG[moduleSlug] || null
}
