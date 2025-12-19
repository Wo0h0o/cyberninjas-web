-- New Achievements for Profile & Resources
-- Run this in Supabase SQL Editor to add new achievements

INSERT INTO achievements (achievement_key, title, description, icon, tier, xp_reward, category, requirement_count)
VALUES
    -- Avatar Achievement
    ('first_impression', 'First Impression', 'Upload your profile picture', '🖼️', 'bronze', 100, 'profile', 1),
    
    -- Bookmark Achievements
    ('bookworm', 'Bookworm', 'Bookmark your first resource', '📚', 'bronze', 50, 'resources', 1),
    ('collector', 'Collector', 'Bookmark 10 resources', '🗃️', 'silver', 150, 'resources', 10),
    ('curator', 'Curator', 'Bookmark 50 resources', '🏛️', 'gold', 500, 'resources', 50)
ON CONFLICT (achievement_key) DO NOTHING;
