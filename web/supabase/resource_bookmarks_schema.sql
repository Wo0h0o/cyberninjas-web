-- Drop table if exists (clean start)
DROP TABLE IF EXISTS resource_bookmarks CASCADE;

-- Create fresh table
CREATE TABLE resource_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bookmarks"
ON resource_bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
ON resource_bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
ON resource_bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_resource_bookmarks_user_id ON resource_bookmarks(user_id);
CREATE INDEX idx_resource_bookmarks_resource_id ON resource_bookmarks(resource_id);
CREATE INDEX idx_resource_bookmarks_created_at ON resource_bookmarks(created_at DESC);
