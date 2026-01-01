-- =====================================================
-- CONTRIBUTION POINTS SYSTEM UPDATE
-- Add contribution_points column and update triggers
-- Points: 3 for topic, 1 for comment
-- =====================================================

-- Add contribution_points column to forum_user_stats
ALTER TABLE public.forum_user_stats 
ADD COLUMN IF NOT EXISTS contribution_points INTEGER DEFAULT 0;

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_forum_user_stats_points 
ON public.forum_user_stats(contribution_points DESC);

-- =====================================================
-- Update trigger for topic creation (+3 points)
-- =====================================================
CREATE OR REPLACE FUNCTION public.on_forum_topic_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Award XP (10 XP for topic)
  PERFORM public.award_forum_xp(NEW.author_id, 10, 'topic_created');
  
  -- Update user stats + contribution points (+3)
  INSERT INTO public.forum_user_stats (user_id, topics_count, contribution_points)
  VALUES (NEW.author_id, 1, 3)
  ON CONFLICT (user_id) DO UPDATE SET
    topics_count = public.forum_user_stats.topics_count + 1,
    contribution_points = public.forum_user_stats.contribution_points + 3,
    updated_at = NOW();
    
  -- Update category count
  UPDATE public.forum_categories
  SET topics_count = topics_count + 1
  WHERE id = NEW.category_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Update trigger for post/comment creation (+1 point)
-- =====================================================
CREATE OR REPLACE FUNCTION public.on_forum_post_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Award XP (5 XP for comment)
  PERFORM public.award_forum_xp(NEW.author_id, 5, 'post_created');
  
  -- Update user stats + contribution points (+1)
  INSERT INTO public.forum_user_stats (user_id, posts_count, contribution_points)
  VALUES (NEW.author_id, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    posts_count = public.forum_user_stats.posts_count + 1,
    contribution_points = public.forum_user_stats.contribution_points + 1,
    updated_at = NOW();
    
  -- Update topic counters
  UPDATE public.forum_topics
  SET 
    posts_count = posts_count + 1,
    last_activity_at = NOW()
  WHERE id = NEW.topic_id;
  
  -- Update category count
  UPDATE public.forum_categories
  SET posts_count = posts_count + 1
  WHERE id = (SELECT category_id FROM public.forum_topics WHERE id = NEW.topic_id);
  
  -- Create notification for topic author
  INSERT INTO public.forum_notifications (user_id, type, topic_id, post_id, actor_id, title, message)
  SELECT 
    t.author_id,
    'reply',
    NEW.topic_id,
    NEW.id,
    NEW.author_id,
    'Нов отговор',
    'Получи нов отговор на темата: ' || t.title
  FROM public.forum_topics t
  WHERE t.id = NEW.topic_id AND t.author_id != NEW.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- View/Function for Top Contributors Leaderboard
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_top_contributors(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  contribution_points INTEGER,
  topics_count INTEGER,
  posts_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fus.user_id,
    p.name,
    p.avatar_url,
    fus.contribution_points,
    fus.topics_count,
    fus.posts_count
  FROM public.forum_user_stats fus
  JOIN public.profiles p ON p.id = fus.user_id
  WHERE fus.contribution_points > 0
  ORDER BY fus.contribution_points DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
