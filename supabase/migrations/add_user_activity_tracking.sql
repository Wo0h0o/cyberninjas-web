-- ============================================
-- MULTI-FEATURE ACTIVITY TRACKING
-- ============================================
-- Purpose: Track user activity across all features (Courses, Prompts, Guides, Resources)
-- This enables adaptive dashboard and cross-feature progress

-- Activity Log Table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  feature_area TEXT NOT NULL,
  item_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_activity_type CHECK (activity_type IN (
    'lesson_started', 'lesson_completed', 'lesson_progress',
    'prompt_copied', 'prompt_favorited', 'prompt_viewed',
    'guide_viewed', 'guide_completed',
    'resource_downloaded', 'resource_viewed'
  )),
  
  CONSTRAINT valid_feature_area CHECK (feature_area IN (
    'courses', 'prompts', 'guides', 'resources'
  ))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_feature ON user_activity(feature_area);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_composite ON user_activity(user_id, feature_area, created_at DESC);

-- Aggregated Stats Table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Courses
  lessons_watched INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  total_watch_time_seconds INTEGER DEFAULT 0,
  
  -- Prompts
  prompts_copied INTEGER DEFAULT 0,
  prompts_favorited INTEGER DEFAULT 0,
  prompts_viewed INTEGER DEFAULT 0,
  
  -- Guides
  guides_viewed INTEGER DEFAULT 0,
  guides_completed INTEGER DEFAULT 0,
  
  -- Resources
  resources_downloaded INTEGER DEFAULT 0,
  resources_viewed INTEGER DEFAULT 0,
  
  -- Meta
  last_active_feature TEXT DEFAULT 'courses',
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_activity_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_last_feature CHECK (last_active_feature IN (
    'courses', 'prompts', 'guides', 'resources'
  ))
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own activity
CREATE POLICY "Users can read own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own activity
CREATE POLICY "Users can insert own activity"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own stats
CREATE POLICY "Users can read own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own stats
CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own stats
CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment user stats (called from app)
CREATE OR REPLACE FUNCTION increment_user_stat(
  p_user_id UUID,
  p_activity_type TEXT,
  p_feature_area TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Upsert user_stats
  INSERT INTO user_stats (user_id, last_active_feature, last_active_at, total_activity_count)
  VALUES (p_user_id, p_feature_area, NOW(), 1)
  ON CONFLICT (user_id) DO UPDATE SET
    last_active_feature = p_feature_area,
    last_active_at = NOW(),
    total_activity_count = user_stats.total_activity_count + 1,
    updated_at = NOW(),
    
    -- Increment feature-specific counters
    lessons_watched = CASE 
      WHEN p_activity_type IN ('lesson_completed', 'lesson_started') 
      THEN user_stats.lessons_watched + 1 
      ELSE user_stats.lessons_watched 
    END,
    
    prompts_copied = CASE 
      WHEN p_activity_type = 'prompt_copied' 
      THEN user_stats.prompts_copied + 1 
      ELSE user_stats.prompts_copied 
    END,
    
    prompts_favorited = CASE 
      WHEN p_activity_type = 'prompt_favorited' 
      THEN user_stats.prompts_favorited + 1 
      ELSE user_stats.prompts_favorited 
    END,
    
    prompts_viewed = CASE 
      WHEN p_activity_type = 'prompt_viewed' 
      THEN user_stats.prompts_viewed + 1 
      ELSE user_stats.prompts_viewed 
    END,
    
    guides_viewed = CASE 
      WHEN p_activity_type = 'guide_viewed' 
      THEN user_stats.guides_viewed + 1 
      ELSE user_stats.guides_viewed 
    END,
    
    guides_completed = CASE 
      WHEN p_activity_type = 'guide_completed' 
      THEN user_stats.guides_completed + 1 
      ELSE user_stats.guides_completed 
    END,
    
    resources_downloaded = CASE 
      WHEN p_activity_type = 'resource_downloaded' 
      THEN user_stats.resources_downloaded + 1 
      ELSE user_stats.resources_downloaded 
    END,
    
    resources_viewed = CASE 
      WHEN p_activity_type = 'resource_viewed' 
      THEN user_stats.resources_viewed + 1 
      ELSE user_stats.resources_viewed 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INITIAL DATA MIGRATION (Optional)
-- ============================================
-- Migrate existing user_progress data to new user_stats table

-- INSERT INTO user_stats (user_id, lessons_watched, total_activity_count, last_active_feature)
-- SELECT 
--   user_id,
--   COUNT(DISTINCT lesson_id) as lessons_watched,
--   COUNT(*) as total_activity_count,
--   'courses' as last_active_feature
-- FROM user_progress
-- WHERE is_completed = true
-- GROUP BY user_id
-- ON CONFLICT (user_id) DO NOTHING;
