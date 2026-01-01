import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAnon, createSupabaseWithToken } from '@/lib/supabase-server'
import type { CreateTopicRequest, TopicsListResponse } from '@/lib/forum-types'

const TOPICS_PER_PAGE = 20

// GET /api/forum/topics - Get topics with infinite scroll pagination
export async function GET(request: NextRequest) {
    try {
        const supabase = createSupabaseAnon()
        const { searchParams } = new URL(request.url)

        const cursor = searchParams.get('cursor')
        const category = searchParams.get('category')
        const tag = searchParams.get('tag')
        const sort = searchParams.get('sort') || 'latest' // latest, popular, unanswered
        const limit = parseInt(searchParams.get('limit') || String(TOPICS_PER_PAGE))

        // Build query - using left joins so topics show even if related data is missing
        let query = supabase
            .from('forum_topics')
            .select(`
                *,
                author:profiles!forum_topics_author_id_fkey(name, avatar_url),
                category:forum_categories!forum_topics_category_id_fkey(id, name, slug, icon),
                topic_tags:forum_topic_tags(tag:forum_tags(name))
            `)
            .eq('is_hidden', false)
            .limit(limit + 1) // Fetch one extra to check if there are more

        // Category filter - filter by category id after fetching
        if (category) {
            // First get category id by slug
            const { data: catData } = await supabase
                .from('forum_categories')
                .select('id')
                .eq('slug', category)
                .single()

            if (catData?.id) {
                query = query.eq('category_id', catData.id)
            }
        }

        // Sorting
        switch (sort) {
            case 'popular':
                query = query.order('views_count', { ascending: false })
                break
            case 'unanswered':
                query = query.eq('is_question', true).eq('is_solved', false)
                query = query.order('created_at', { ascending: false })
                break
            case 'latest':
            default:
                query = query.order('last_activity_at', { ascending: false })
        }

        // Cursor-based pagination
        if (cursor) {
            const cursorDate = new Date(cursor).toISOString()
            query = query.lt('last_activity_at', cursorDate)
        }

        const { data: topics, error } = await query

        if (error) {
            console.error('Error fetching topics:', error)
            return NextResponse.json(
                { error: 'Failed to fetch topics' },
                { status: 500 }
            )
        }

        // Check if there are more results
        const hasMore = topics && topics.length > limit
        const resultTopics = hasMore ? topics.slice(0, limit) : (topics || [])

        // Get next cursor
        const nextCursor = hasMore && resultTopics.length > 0
            ? (resultTopics[resultTopics.length - 1] as { last_activity_at?: string }).last_activity_at || null
            : null

        // Transform data
        const transformedTopics = resultTopics.map((topic: Record<string, unknown>) => ({
            ...topic,
            author_name: (topic.author as { name?: string } | null)?.name || 'Анонимен',
            author_avatar: (topic.author as { avatar_url?: string } | null)?.avatar_url || null,
            author_level: 1, // Default to level 1 since we don't fetch user_levels
            category_name: (topic.category as { name?: string } | null)?.name || null,
            category_slug: (topic.category as { slug?: string } | null)?.slug || null,
            category_icon: (topic.category as { icon?: string } | null)?.icon || null,
            tags: ((topic.topic_tags as Array<{ tag: { name: string } }>) || [])
                .map(tt => tt.tag?.name)
                .filter(Boolean)
        }))

        const response: TopicsListResponse = {
            topics: transformedTopics,
            nextCursor,
            total: transformedTopics.length
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Topics API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/forum/topics - Create a new topic
export async function POST(request: NextRequest) {
    try {
        // Try token-based auth first (from Authorization header)
        const { supabase, user, error: tokenError } = await createSupabaseWithToken(request)

        if (tokenError || !supabase || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = user.id
        const body: CreateTopicRequest = await request.json()

        // Validate required fields
        if (!body.title?.trim() || !body.content?.trim() || !body.category_id) {
            return NextResponse.json(
                { error: 'Title, content, and category are required' },
                { status: 400 }
            )
        }

        // Check user trust level for rate limiting
        const { data: userLevel } = await supabase
            .from('user_levels')
            .select('level')
            .eq('user_id', userId)
            .single()

        const level = userLevel?.level || 1
        const trustLevel = level >= 10 ? 4 : level >= 6 ? 3 : level >= 3 ? 2 : 1

        // Rate limiting for Novice users (trust level 1)
        if (trustLevel === 1) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
            const { count } = await supabase
                .from('forum_topics')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', userId)
                .gte('created_at', oneHourAgo)

            if (count && count >= 1) {
                return NextResponse.json(
                    { error: 'Можеш да създадеш само 1 тема на час. Опитай отново по-късно.' },
                    { status: 429 }
                )
            }
        }

        // Generate slug
        const slug = generateSlug(body.title)

        // Create preview from content (first 200 chars)
        const preview = body.content.substring(0, 200).replace(/\n/g, ' ')

        // Insert topic
        const { data: topic, error: insertError } = await supabase
            .from('forum_topics')
            .insert({
                title: body.title.trim(),
                content: body.content.trim(),
                preview,
                slug,
                author_id: userId,
                category_id: body.category_id,
                is_question: body.is_question || false,
                wiki_mode: body.wiki_mode || false
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error creating topic:', insertError)
            // Handle duplicate slug
            if (insertError.code === '23505') {
                return NextResponse.json(
                    { error: 'Тема с подобно заглавие вече съществува' },
                    { status: 409 }
                )
            }
            return NextResponse.json(
                { error: 'Failed to create topic' },
                { status: 500 }
            )
        }

        // Add tags if provided
        if (body.tags && body.tags.length > 0) {
            for (const tagName of body.tags.slice(0, 5)) { // Max 5 tags
                // Get or create tag
                const tagSlug = generateSlug(tagName)
                let { data: tag } = await supabase
                    .from('forum_tags')
                    .select('id')
                    .eq('slug', tagSlug)
                    .single()

                if (!tag) {
                    const { data: newTag } = await supabase
                        .from('forum_tags')
                        .insert({ name: tagName.trim(), slug: tagSlug })
                        .select('id')
                        .single()
                    tag = newTag
                }

                if (tag) {
                    await supabase
                        .from('forum_topic_tags')
                        .insert({ topic_id: topic.id, tag_id: tag.id })
                }
            }
        }

        return NextResponse.json({ topic }, { status: 201 })
    } catch (error) {
        console.error('Create topic error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to generate URL-safe slug
function generateSlug(title: string): string {
    // Cyrillic to Latin transliteration for Bulgarian
    const cyrillicToLatin: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
        'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': '',
        'ю': 'yu', 'я': 'ya'
    }

    let slug = title.toLowerCase()

    // Transliterate Cyrillic
    slug = slug.split('').map(char => cyrillicToLatin[char] || char).join('')

    // Remove special characters and replace spaces with hyphens
    slug = slug
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100)
        .replace(/^-+|-+$/g, '')

    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36)
    return `${slug}-${timestamp}`
}
