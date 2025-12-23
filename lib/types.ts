// Database types generated from Supabase schema

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at'>
                Update: Partial<Profile>
            }
            courses: {
                Row: Course
                Insert: Omit<Course, 'id' | 'created_at'>
                Update: Partial<Course>
            }
            modules: {
                Row: Module
                Insert: Omit<Module, 'id'>
                Update: Partial<Module>
            }
            lessons: {
                Row: Lesson
                Insert: Omit<Lesson, 'id'>
                Update: Partial<Lesson>
            }
            user_progress: {
                Row: UserProgress
                Insert: Omit<UserProgress, 'id'>
                Update: Partial<UserProgress>
            }
            purchases: {
                Row: Purchase
                Insert: Omit<Purchase, 'id' | 'purchased_at'>
                Update: Partial<Purchase>
            }
        }
    }
}

export interface Profile {
    id: string
    email: string
    name: string | null
    avatar_url: string | null
    subscription_tier: 'free' | 'paid'
    role: 'user' | 'admin'
    created_at: string
    last_login: string | null
}

export interface Course {
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail_url: string | null
    price_bgn: number
    order_index: number
    is_published: boolean
    difficulty: 'beginner' | 'intermediate' | 'advanced' | null
    created_at: string
}

export interface Module {
    id: string
    course_id: string
    title: string
    order_index: number
}

export interface Lesson {
    id: string
    module_id: string
    title: string
    description: string | null
    video_url: string | null
    duration_seconds: number
    content_html: string | null
    is_free_preview: boolean
    order_index: number
}

export interface UserProgress {
    id: string
    user_id: string
    lesson_id: string
    is_completed: boolean
    video_position_seconds: number
    completed_at: string | null
}

export interface Purchase {
    id: string
    user_id: string
    course_id: string | null
    stripe_payment_id: string | null
    amount_bgn: number
    source: 'stripe' | 'manual' | 'referral'
    purchased_at: string
}

// Extended types with relations
export interface CourseWithModules extends Course {
    modules: ModuleWithLessons[]
}

export interface ModuleWithLessons extends Module {
    lessons: Lesson[]
}

export interface CourseWithProgress extends Course {
    progress: {
        completed: number
        total: number
        percentage: number
    }
}

// Helper type for lesson with progress
export interface LessonWithProgress extends Lesson {
    progress: UserProgress | null
}

// =====================================================
// PROMPT LIBRARY TYPES
// =====================================================

export interface PromptLibrary {
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail_url: string | null
    introduction: string | null // Markdown intro text
    is_premium: boolean
    is_published: boolean
    order_index: number
    created_at: string
}

export interface LibraryModule {
    id: string
    library_id: string
    title: string
    subtitle: string | null
    introduction: string | null
    icon: string | null
    order_index: number
}

export interface ModuleSection {
    id: string
    module_id: string
    title: string | null
    content: string
    section_type: 'narrative' | 'instructions' | 'example' | 'warning'
    order_index: number
}

export interface PromptCategory {
    id: string
    module_id: string
    title: string
    description: string | null
    order_index: number
}

export interface Prompt {
    id: string
    category_id: string
    title: string
    prompt_text: string
    description: string | null
    usage_tips: string | null
    expected_result: string | null
    tags: string[] | null
    is_premium: boolean
    order_index: number
    created_at: string
}

export interface UserFavorite {
    user_id: string
    prompt_id: string
    created_at: string
}

// Extended types with relations
export interface PromptLibraryWithModules extends PromptLibrary {
    modules: LibraryModuleWithContent[]
}

export interface LibraryModuleWithContent extends LibraryModule {
    sections: ModuleSection[]
    categories: PromptCategoryWithPrompts[]
}

export interface PromptCategoryWithPrompts extends PromptCategory {
    prompts: Prompt[]
}

export interface PromptWithFavorite extends Prompt {
    is_favorite: boolean
}

// Legacy type for backwards compatibility (if needed)
export interface PromptLibraryWithCategories extends PromptLibrary {
    categories: PromptCategoryWithPrompts[]
}

