-- =====================================================
-- ENHANCED COURSE CARDS: Add new columns to courses table
-- =====================================================

-- Instructor information
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_name TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS instructor_avatar_url TEXT;

-- Learning outcomes (what you'll learn)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[];

-- Tags/skills
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Cached stats (for performance)
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_duration_minutes INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0;

-- Ratings
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0;

-- Add difficulty column if not exists (was in interface but not in schema)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'difficulty') THEN
        ALTER TABLE public.courses ADD COLUMN difficulty TEXT DEFAULT 'beginner' 
            CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
    END IF;
END $$;

-- =====================================================
-- Update existing courses with sample data
-- =====================================================

UPDATE public.courses SET
    instructor_name = 'Петър Гаврилов',
    instructor_avatar_url = '/images/instructors/petar.jpg',
    learning_outcomes = ARRAY[
        'Основи на Prompt Engineering',
        'Комуникация с AI модели',
        'Изграждане на персонализирани агенти'
    ],
    tags = ARRAY['ChatGPT', 'Claude', 'Prompt Engineering', 'AI'],
    difficulty = 'beginner',
    total_duration_minutes = 480,
    students_count = 127,
    average_rating = 4.9,
    ratings_count = 89
WHERE slug = 'dna-protocol';

UPDATE public.courses SET
    instructor_name = 'Петър Гаврилов',
    instructor_avatar_url = '/images/instructors/petar.jpg',
    learning_outcomes = ARRAY[
        'AI видео генерация от нулата',
        'Маркетинг материали без дизайнер',
        'Автоматизация на визуално съдържание'
    ],
    tags = ARRAY['Midjourney', 'DALL-E', 'Video AI', 'Marketing'],
    difficulty = 'intermediate',
    total_duration_minutes = 360,
    students_count = 84,
    average_rating = 4.8,
    ratings_count = 56
WHERE slug = 'visual-godmode';

UPDATE public.courses SET
    instructor_name = 'Петър Гаврилов',
    instructor_avatar_url = '/images/instructors/petar.jpg',
    learning_outcomes = ARRAY[
        'Workflow automation основи',
        'Свързване на инструменти',
        'Спестяване на 20+ часа седмично'
    ],
    tags = ARRAY['Zapier', 'Make', 'Automation', 'Productivity'],
    difficulty = 'intermediate',
    total_duration_minutes = 420,
    students_count = 63,
    average_rating = 4.7,
    ratings_count = 41
WHERE slug = 'orchestrator';

UPDATE public.courses SET
    instructor_name = 'Петър Гаврилов',
    instructor_avatar_url = '/images/instructors/petar.jpg',
    learning_outcomes = ARRAY[
        'Blockchain фундаменти',
        'Web3 стратегии',
        'Крипто анализ и инвестиции'
    ],
    tags = ARRAY['Blockchain', 'Web3', 'Crypto', 'DeFi'],
    difficulty = 'advanced',
    total_duration_minutes = 540,
    students_count = 52,
    average_rating = 4.6,
    ratings_count = 28
WHERE slug = 'crypto-mastery';
