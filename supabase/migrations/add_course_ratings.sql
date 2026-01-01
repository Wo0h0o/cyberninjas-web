-- =====================================================
-- COURSE RATINGS SYSTEM
-- Only users who purchased a course can rate it
-- =====================================================

-- Course Ratings Table
CREATE TABLE IF NOT EXISTS public.course_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT, -- Optional review text
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id) -- One rating per user per course
);

-- Enable RLS
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings (for displaying on course page)
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.course_ratings;
CREATE POLICY "Anyone can view ratings" ON public.course_ratings
    FOR SELECT USING (true);

-- Users can only insert rating if they purchased the course
DROP POLICY IF EXISTS "Purchasers can rate courses" ON public.course_ratings;
CREATE POLICY "Purchasers can rate courses" ON public.course_ratings
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.purchases p 
            WHERE p.user_id = auth.uid() 
            AND p.course_id = course_ratings.course_id
        )
    );

-- Users can update their own ratings
DROP POLICY IF EXISTS "Users can update own ratings" ON public.course_ratings;
CREATE POLICY "Users can update own ratings" ON public.course_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own ratings
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.course_ratings;
CREATE POLICY "Users can delete own ratings" ON public.course_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: Update course average rating
-- Automatically updates courses.average_rating when ratings change
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the course's cached rating values
    UPDATE public.courses SET
        average_rating = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM public.course_ratings
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        ), 0),
        ratings_count = (
            SELECT COUNT(*)
            FROM public.course_ratings
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update course rating on insert/update/delete
DROP TRIGGER IF EXISTS on_course_rating_change ON public.course_ratings;
CREATE TRIGGER on_course_rating_change
    AFTER INSERT OR UPDATE OR DELETE ON public.course_ratings
    FOR EACH ROW EXECUTE FUNCTION public.update_course_rating();

-- =====================================================
-- INDEX for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_course_ratings_course_id ON public.course_ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_ratings_user_id ON public.course_ratings(user_id);
