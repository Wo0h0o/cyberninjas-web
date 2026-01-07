-- =====================================================
-- DROP COMPANION/GAMIFICATION TABLES
-- Run this in Supabase SQL Editor to clean up deprecated tables
-- =====================================================

-- Drop policies first
DROP POLICY IF EXISTS "Active companion messages viewable" ON public.companion_messages;
DROP POLICY IF EXISTS "Only admins can manage companion messages" ON public.companion_messages;
DROP POLICY IF EXISTS "Users can view own history" ON public.user_companion_history;
DROP POLICY IF EXISTS "Users can insert own history" ON public.user_companion_history;

-- Drop indexes
DROP INDEX IF EXISTS idx_companion_history_user_id;
DROP INDEX IF EXISTS idx_companion_messages_code;

-- Drop tables (order matters due to foreign key)
DROP TABLE IF EXISTS public.user_companion_history CASCADE;
DROP TABLE IF EXISTS public.companion_messages CASCADE;

-- Verify cleanup
SELECT 'Cleaned up companion tables' AS status;
