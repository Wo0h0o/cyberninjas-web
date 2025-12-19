-- Resource Bookmarks Table
-- Allows users to bookmark resources for quick access
-- NOTE: Using TEXT for resource_id since resources table structure is TBD

CREATE TABLE IF NOT EXISTS resource_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resource_id TEXT NOT NULL,  -- Changed from UUID FK to TEXT
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One bookmark per resource per user
    UNIQUE(user_id, resource_id)
);

-- RLS Policies
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
ON resource_bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can bookmark resources
CREATE POLICY "Users can insert own bookmarks"
ON resource_bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can unbookmark resources
CREATE POLICY "Users can delete own bookmarks"
ON resource_bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user_id 
ON resource_bookmarks(user_id);

CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_resource_id 
ON resource_bookmarks(resource_id);

CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_created_at 
ON resource_bookmarks(created_at DESC);
