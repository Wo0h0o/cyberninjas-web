-- Platform Visits Tracking Table
-- Tracks which AI platforms users have explored

CREATE TABLE IF NOT EXISTS platform_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE NOT NULL,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one visit per platform per user
    UNIQUE(user_id, platform_id)
);

-- RLS Policies
ALTER TABLE platform_visits ENABLE ROW LEVEL SECURITY;

-- Users can view their own visits
CREATE POLICY "Users can view own platform visits"
ON platform_visits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own visits
CREATE POLICY "Users can insert own platform visits"
ON platform_visits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_visits_user_id 
ON platform_visits(user_id);

CREATE INDEX IF NOT EXISTS idx_platform_visits_platform_id 
ON platform_visits(platform_id);

CREATE INDEX IF NOT EXISTS idx_platform_visits_visited_at 
ON platform_visits(visited_at DESC);
