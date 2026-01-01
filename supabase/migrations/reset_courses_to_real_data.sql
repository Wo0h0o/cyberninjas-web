-- =====================================================
-- RESET CACHED VALUES TO ACTUAL DATA
-- Run this to update the cached counts with real data
-- =====================================================

-- Update students_count from actual purchases
UPDATE public.courses c SET
    students_count = (
        SELECT COUNT(*) FROM public.purchases p WHERE p.course_id = c.id
    );

-- Update total_duration_minutes from actual lessons
UPDATE public.courses c SET
    total_duration_minutes = COALESCE((
        SELECT SUM(l.duration_seconds) / 60
        FROM public.lessons l
        JOIN public.modules m ON l.module_id = m.id
        WHERE m.course_id = c.id
    ), 0);

-- Reset ratings to 0 (no rating system yet)
UPDATE public.courses SET
    average_rating = 0,
    ratings_count = 0;

-- Set instructor for all courses (update with real instructor name)
UPDATE public.courses SET
    instructor_name = 'Петър Гаврилов',
    instructor_avatar_url = NULL;
