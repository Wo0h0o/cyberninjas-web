-- Page Bookmarks Table for Resources Navigation
-- Allows users to bookmark specific pages within resources

DROP TABLE IF EXISTS bookmark_data CASCADE;

CREATE TABLE bookmark_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_slug TEXT NOT NULL,
    page_index INTEGER NOT NULL,
    page_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, resource_slug, page_index)
);

-- Enable RLS
ALTER TABLE bookmark_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bookmarks"
ON bookmark_data FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
ON bookmark_data FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
ON bookmark_data FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_bookmark_data_user_id ON bookmark_data(user_id);
CREATE INDEX idx_bookmark_data_resource_slug ON bookmark_data(resource_slug);
CREATE INDEX idx_bookmark_data_user_resource ON bookmark_data(user_id, resource_slug);
