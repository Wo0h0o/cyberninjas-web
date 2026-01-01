import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'

interface TopicPageProps {
    params: Promise<{ slug: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
    const { slug } = await params
    const supabase = createServerClient()

    const { data: topic } = await supabase
        .from('forum_topics')
        .select('title, preview, author:profiles(name), category:forum_categories(name)')
        .eq('slug', slug)
        .eq('is_hidden', false)
        .single()

    if (!topic) {
        return {
            title: 'Тема не е намерена | CyberNinjas Форум'
        }
    }

    const authorName = (topic.author as { name: string } | null)?.name || 'Потребител'
    const categoryName = (topic.category as { name: string } | null)?.name || 'Форум'

    return {
        title: `${topic.title} | CyberNinjas Форум`,
        description: topic.preview || `Дискусия в ${categoryName} от ${authorName}`,
        openGraph: {
            title: topic.title,
            description: topic.preview || `Дискусия в ${categoryName}`,
            type: 'article',
            authors: [authorName],
        },
        twitter: {
            card: 'summary',
            title: topic.title,
            description: topic.preview || 'CyberNinjas Форум'
        }
    }
}

// Structured data for SEO
export function generateStructuredData(topic: {
    title: string
    content: string
    author_name: string
    created_at: string
    posts_count: number
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'DiscussionForumPosting',
        headline: topic.title,
        text: topic.content.substring(0, 500),
        author: {
            '@type': 'Person',
            name: topic.author_name
        },
        datePublished: topic.created_at,
        interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: topic.posts_count
        }
    }
}
