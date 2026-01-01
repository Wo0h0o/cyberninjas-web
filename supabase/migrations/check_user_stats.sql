-- Quick check: Does user_stats table exist and have correct RLS?
-- Run this in Supabase SQL Editor to verify

-- 1. Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_stats'
);

-- 2. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_stats';

-- 3. Try to select as current user (should work if RLS is correct)
SELECT * FROM user_stats WHERE user_id = auth.uid();

-- 4. If above fails, check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'increment_user_stat';
