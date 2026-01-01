'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Guide, GuideWithModules } from '@/types/guides'

export function useGuides() {
    const [guides, setGuides] = useState<Guide[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchGuides() {
            try {
                const { data, error } = await supabase
                    .from('guides')
                    .select('*')
                    .eq('is_published', true)
                    .order('order_index')

                if (error) throw error
                setGuides(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load guides')
            } finally {
                setLoading(false)
            }
        }

        fetchGuides()
    }, [])

    return { guides, loading, error }
}

export function useGuide(slug: string) {
    const [guide, setGuide] = useState<GuideWithModules | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchGuide() {
            try {
                // Fetch guide with modules and content
                const { data: guideData, error: guideError } = await supabase
                    .from('guides')
                    .select(`
            *,
            modules:guide_modules(
              *,
              content:guide_content(*)
            )
          `)
                    .eq('slug', slug)
                    .eq('is_published', true)
                    .single()

                if (guideError) throw guideError

                // Sort modules and content by order_index
                if (guideData) {
                    guideData.modules = guideData.modules
                        .sort((a: any, b: any) => a.order_index - b.order_index)
                        .map((module: any) => ({
                            ...module,
                            content: module.content.sort((a: any, b: any) => a.order_index - b.order_index)
                        }))
                }

                setGuide(guideData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Guide not found')
            } finally {
                setLoading(false)
            }
        }

        fetchGuide()
    }, [slug])

    return { guide, loading, error }
}
