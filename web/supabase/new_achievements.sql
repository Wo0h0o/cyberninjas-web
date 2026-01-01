-- New Achievements for Profile & Resources
-- Run this in Supabase SQL Editor to add new achievements

INSERT INTO achievements (code, name, description, icon, tier, xp_reward)
VALUES
    -- Avatar Achievement (tier 1 = bronze)
    ('first_impression', 'First Impression', 'Upload your profile picture', '🖼️', 1, 100),
    
    -- Bookmark Achievements
    ('bookworm', 'Bookworm', 'Bookmark your first resource', '📚', 1, 50),
    ('collector', 'Collector', 'Bookmark 10 resources', '🗃️', 2, 150),
    ('curator', 'Curator', 'Bookmark 50 resources', '🏛️', 3, 500)
ON CONFLICT (code) DO NOTHING;
