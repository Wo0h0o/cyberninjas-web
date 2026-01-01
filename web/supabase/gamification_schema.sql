-- =====================================================
-- GAMIFICATION SYSTEM TABLES
-- =====================================================

-- =====================================================
-- USER LEVELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_levels (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  title TEXT DEFAULT 'Novice',
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;

-- User levels policies
DROP POLICY IF EXISTS "Users can view own level" ON public.user_levels;
CREATE POLICY "Users can view own level" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own level" ON public.user_levels;
CREATE POLICY "Users can update own level" ON public.user_levels
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own level" ON public.user_levels;
CREATE POLICY "Users can insert own level" ON public.user_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tier INTEGER DEFAULT 1,
  is_secret BOOLEAN DEFAULT false,
  xp_reward INTEGER DEFAULT 0,
  trigger_conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read, admin write)
DROP POLICY IF EXISTS "Achievements are viewable by all" ON public.achievements;
CREATE POLICY "Achievements are viewable by all" ON public.achievements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage achievements" ON public.achievements;
CREATE POLICY "Only admins can manage achievements" ON public.achievements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- USER ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- User achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER BUILDS TABLE (Impact Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT,
  time_saved_minutes INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'weekly',
  times_used INTEGER DEFAULT 0,
  money_saved_estimate DECIMAL DEFAULT 0,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.user_builds ENABLE ROW LEVEL SECURITY;

-- User builds policies
DROP POLICY IF EXISTS "Users can view own builds" ON public.user_builds;
CREATE POLICY "Users can view own builds" ON public.user_builds
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own builds" ON public.user_builds;
CREATE POLICY "Users can manage own builds" ON public.user_builds
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- COMPANION MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companion_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  trigger_type TEXT NOT NULL,
  message_template TEXT NOT NULL,
  avatar_emotion TEXT DEFAULT 'happy',
  action_buttons JSONB,
  trigger_conditions JSONB,
  frequency_rules JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companion_messages ENABLE ROW LEVEL SECURITY;

-- Companion messages policies (public read active messages)
DROP POLICY IF EXISTS "Active companion messages viewable" ON public.companion_messages;
CREATE POLICY "Active companion messages viewable" ON public.companion_messages
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can manage companion messages" ON public.companion_messages;
CREATE POLICY "Only admins can manage companion messages" ON public.companion_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- USER COMPANION HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_companion_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.companion_messages(id) ON DELETE CASCADE,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  action_taken TEXT
);

-- Enable RLS
ALTER TABLE public.user_companion_history ENABLE ROW LEVEL SECURITY;

-- User companion history policies
DROP POLICY IF EXISTS "Users can view own history" ON public.user_companion_history;
CREATE POLICY "Users can view own history" ON public.user_companion_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own history" ON public.user_companion_history;
CREATE POLICY "Users can insert own history" ON public.user_companion_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- JOURNEY MILESTONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.journey_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  key_events JSONB,
  narrative_text TEXT
);

-- Enable RLS
ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;

-- Journey milestones policies
DROP POLICY IF EXISTS "Users can view own journey" ON public.journey_milestones;
CREATE POLICY "Users can view own journey" ON public.journey_milestones
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage journey" ON public.journey_milestones;
CREATE POLICY "System can manage journey" ON public.journey_milestones
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON public.user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_builds_user_id ON public.user_builds(user_id);
CREATE INDEX IF NOT EXISTS idx_user_builds_lesson_id ON public.user_builds(lesson_id);
CREATE INDEX IF NOT EXISTS idx_companion_history_user_id ON public.user_companion_history(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_user_id ON public.journey_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_code ON public.achievements(code);
CREATE INDEX IF NOT EXISTS idx_companion_messages_code ON public.companion_messages(code);
