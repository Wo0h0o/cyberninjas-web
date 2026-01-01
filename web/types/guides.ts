export interface Guide {
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail_url: string | null
    introduction: string | null // Markdown
    difficulty: 'beginner' | 'intermediate' | 'advanced' | null
    is_premium: boolean
    is_published: boolean
    order_index: number
    created_at: string
    updated_at: string
}

export interface GuideModule {
    id: string
    guide_id: string
    title: string
    description: string | null
    order_index: number
    created_at: string
}

export interface GuideContent {
    id: string
    module_id: string
    title: string
    content_text: string | null // Markdown

    // Multi-format URLs
    pdf_url: string | null
    video_url: string | null
    presentation_url: string | null // Google Slides embed
    audio_url: string | null

    images: string[] | null // Array of image URLs
    estimated_reading_time: number | null // Minutes
    estimated_video_duration: number | null // Seconds

    order_index: number
    created_at: string
    updated_at: string
}

export interface GuideWithModules extends Guide {
    modules: (GuideModule & {
        content: GuideContent[]
    })[]
}

export interface UserGuideProgress {
    id: string
    user_id: string
    module_id: string
    is_completed: boolean
    reading_position: number
    video_position_seconds: number
    audio_position_seconds: number
    completed_at: string | null
    last_accessed_at: string
}
