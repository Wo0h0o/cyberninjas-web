-- =====================================================
-- SKILL TREE SCHEMA
-- Hierarchical structure for skill tree modules
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- SKILL TREE MODULES TABLE
-- Main table with parent_id for tree hierarchy
-- =====================================================
CREATE TABLE IF NOT EXISTS public.skill_tree_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.skill_tree_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,                           -- lucide icon name (e.g., 'Brain', 'Cpu')
  duration TEXT,                       -- e.g., '~45 мин'
  xp_reward INTEGER DEFAULT 100,
  intro TEXT,                          -- markdown introduction
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.skill_tree_modules ENABLE ROW LEVEL SECURITY;

-- Everyone can view published modules
DROP POLICY IF EXISTS "Skill tree modules are viewable by everyone" ON public.skill_tree_modules;
CREATE POLICY "Skill tree modules are viewable by everyone" ON public.skill_tree_modules
  FOR SELECT USING (is_published = true);

-- Admins can manage modules
DROP POLICY IF EXISTS "Admins can manage skill tree modules" ON public.skill_tree_modules;
CREATE POLICY "Admins can manage skill tree modules" ON public.skill_tree_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for faster tree queries
CREATE INDEX IF NOT EXISTS idx_skill_tree_modules_parent ON public.skill_tree_modules(parent_id);
CREATE INDEX IF NOT EXISTS idx_skill_tree_modules_slug ON public.skill_tree_modules(slug);

-- =====================================================
-- SKILL TREE SECTIONS TABLE
-- Content sections for each module
-- =====================================================
CREATE TABLE IF NOT EXISTS public.skill_tree_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.skill_tree_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,               -- markdown content
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.skill_tree_sections ENABLE ROW LEVEL SECURITY;

-- Sections viewable if module is published
DROP POLICY IF EXISTS "Skill tree sections are viewable if module is published" ON public.skill_tree_sections;
CREATE POLICY "Skill tree sections are viewable if module is published" ON public.skill_tree_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.skill_tree_modules WHERE id = module_id AND is_published = true)
  );

-- Admins can manage sections
DROP POLICY IF EXISTS "Admins can manage skill tree sections" ON public.skill_tree_sections;
CREATE POLICY "Admins can manage skill tree sections" ON public.skill_tree_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_skill_tree_sections_module ON public.skill_tree_sections(module_id);

-- =====================================================
-- SKILL TREE TAKEAWAYS TABLE
-- Key takeaways for each module
-- =====================================================
CREATE TABLE IF NOT EXISTS public.skill_tree_takeaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.skill_tree_modules(id) ON DELETE CASCADE,
  takeaway TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.skill_tree_takeaways ENABLE ROW LEVEL SECURITY;

-- Takeaways viewable if module is published
DROP POLICY IF EXISTS "Skill tree takeaways are viewable if module is published" ON public.skill_tree_takeaways;
CREATE POLICY "Skill tree takeaways are viewable if module is published" ON public.skill_tree_takeaways
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.skill_tree_modules WHERE id = module_id AND is_published = true)
  );

-- Admins can manage takeaways
DROP POLICY IF EXISTS "Admins can manage skill tree takeaways" ON public.skill_tree_takeaways;
CREATE POLICY "Admins can manage skill tree takeaways" ON public.skill_tree_takeaways
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_skill_tree_takeaways_module ON public.skill_tree_takeaways(module_id);

-- =====================================================
-- USER SKILL TREE PROGRESS TABLE
-- Track user completion of modules
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_skill_tree_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.skill_tree_modules(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.user_skill_tree_progress ENABLE ROW LEVEL SECURITY;

-- Users can view own progress
DROP POLICY IF EXISTS "Users can view own skill tree progress" ON public.user_skill_tree_progress;
CREATE POLICY "Users can view own skill tree progress" ON public.user_skill_tree_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own progress
DROP POLICY IF EXISTS "Users can insert own skill tree progress" ON public.user_skill_tree_progress;
CREATE POLICY "Users can insert own skill tree progress" ON public.user_skill_tree_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own progress
DROP POLICY IF EXISTS "Users can update own skill tree progress" ON public.user_skill_tree_progress;
CREATE POLICY "Users can update own skill tree progress" ON public.user_skill_tree_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_skill_tree_progress_user ON public.user_skill_tree_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_tree_progress_module ON public.user_skill_tree_progress(module_id);

-- =====================================================
-- HELPER FUNCTION: Get module with all children (recursive)
-- =====================================================
CREATE OR REPLACE FUNCTION get_skill_tree_branch(root_slug TEXT)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  parent_id UUID,
  title TEXT,
  subtitle TEXT,
  icon TEXT,
  duration TEXT,
  xp_reward INTEGER,
  intro TEXT,
  order_index INTEGER,
  depth INTEGER
) AS $$
WITH RECURSIVE tree AS (
  -- Base case: get root module
  SELECT 
    m.id, m.slug, m.parent_id, m.title, m.subtitle, m.icon, 
    m.duration, m.xp_reward, m.intro, m.order_index,
    0 AS depth
  FROM public.skill_tree_modules m
  WHERE m.slug = root_slug AND m.is_published = true
  
  UNION ALL
  
  -- Recursive case: get children
  SELECT 
    child.id, child.slug, child.parent_id, child.title, child.subtitle, child.icon,
    child.duration, child.xp_reward, child.intro, child.order_index,
    tree.depth + 1
  FROM public.skill_tree_modules child
  INNER JOIN tree ON child.parent_id = tree.id
  WHERE child.is_published = true
)
SELECT * FROM tree ORDER BY depth, order_index;
$$ LANGUAGE SQL STABLE;
