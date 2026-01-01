-- =====================================================
-- SUPABASE SECURITY FIXES
-- Run this script in Supabase SQL Editor to fix all security warnings
-- =====================================================

-- Fix 1: forum_topics_view - Change from SECURITY DEFINER to SECURITY INVOKER
DROP VIEW IF EXISTS public.forum_topics_view;

CREATE VIEW public.forum_topics_view 
WITH (security_invoker = true)
AS
SELECT 
  t.*,
  p.name AS author_name,
  p.avatar_url AS author_avatar,
  ul.level AS author_level,
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon,
  ARRAY(
    SELECT tag.name FROM public.forum_tags tag
    JOIN public.forum_topic_tags tt ON tt.tag_id = tag.id
    WHERE tt.topic_id = t.id
  ) AS tags
FROM public.forum_topics t
LEFT JOIN public.profiles p ON t.author_id = p.id
LEFT JOIN public.user_levels ul ON t.author_id = ul.user_id
LEFT JOIN public.forum_categories c ON t.category_id = c.id;

-- =====================================================
-- Fix 2-12: Set search_path for all functions
-- This prevents search_path injection attacks
-- =====================================================

-- Fix award_forum_xp
ALTER FUNCTION public.award_forum_xp SET search_path = public;

-- Fix increment_user_stat
ALTER FUNCTION public.increment_user_stat SET search_path = public;

-- Fix on_forum_topic_created
ALTER FUNCTION public.on_forum_topic_created SET search_path = public;

-- Fix increment_topic_views
ALTER FUNCTION public.increment_topic_views SET search_path = public;

-- Fix on_forum_post_created
ALTER FUNCTION public.on_forum_post_created SET search_path = public;

-- Fix on_forum_reaction_created
ALTER FUNCTION public.on_forum_reaction_created SET search_path = public;

-- Fix on_solution_marked
ALTER FUNCTION public.on_solution_marked SET search_path = public;

-- Fix get_forum_trust_level
ALTER FUNCTION public.get_forum_trust_level SET search_path = public;

-- Fix create_notification_preferences_for_user
ALTER FUNCTION public.create_notification_preferences_for_user SET search_path = public;

-- Fix update_notification_preferences_updated_at
ALTER FUNCTION public.update_notification_preferences_updated_at SET search_path = public;

-- Fix handle_new_user
ALTER FUNCTION public.handle_new_user SET search_path = public;

-- =====================================================
-- VERIFICATION
-- Run this to verify fixes were applied
-- =====================================================
SELECT 
  proname as function_name,
  proconfig as config
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
AND proname IN (
  'award_forum_xp',
  'increment_user_stat',
  'on_forum_topic_created',
  'increment_topic_views',
  'on_forum_post_created',
  'on_forum_reaction_created',
  'on_solution_marked',
  'get_forum_trust_level',
  'create_notification_preferences_for_user',
  'update_notification_preferences_updated_at',
  'handle_new_user'
);
