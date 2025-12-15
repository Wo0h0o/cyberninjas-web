-- =====================================================
-- MIGRATION: Modular Prompt Library Structure
-- Run this BEFORE running the full schema.sql
-- =====================================================

-- Drop old prompt library tables (in correct order due to FK constraints)
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.prompts CASCADE;
DROP TABLE IF EXISTS public.prompt_categories CASCADE;
DROP TABLE IF EXISTS public.module_sections CASCADE;
DROP TABLE IF EXISTS public.library_modules CASCADE;
DROP TABLE IF EXISTS public.prompt_libraries CASCADE;

-- Confirm drops
SELECT 'Old tables dropped successfully' as status;
