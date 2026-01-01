import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// GET /api/forum/categories - Get all active categories
export async function GET() {
    try {
        const supabase = await createSupabaseServer()

        const { data: categories, error } = await supabase
            .from('forum_categories')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return NextResponse.json(
                { error: 'Failed to fetch categories' },
                { status: 500 }
            )
        }

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Categories API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
