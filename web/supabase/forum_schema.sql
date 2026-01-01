-- =====================================================
-- FORUM SYSTEM DATABASE SCHEMA
-- CyberNinjas Platform - SEO-Friendly Community Forum
-- =====================================================

-- =====================================================
-- FORUM CATEGORIES TABLE
-- Maximum 3-4 categories to avoid "empty forum" feel
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- Emoji or icon class
  color TEXT, -- Hex color for styling
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  topics_count INTEGER DEFAULT 0,  -- Denormalized for performance
  posts_count INTEGER DEFAULT 0,   -- Denormalized for performance
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Categories are public (for SEO)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.forum_categories;
CREATE POLICY "Categories are viewable by everyone" ON public.forum_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.forum_categories;
CREATE POLICY "Admins can manage categories" ON public.forum_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- FORUM TAGS TABLE
-- Flexible tagging system for filtering
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8B5CF6',  -- Default to brand violet
  usage_count INTEGER DEFAULT 0,  -- For trending tags
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;

-- Tags are public
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.forum_tags;
CREATE POLICY "Tags are viewable by everyone" ON public.forum_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.forum_tags;
CREATE POLICY "Authenticated users can create tags" ON public.forum_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.forum_tags;
CREATE POLICY "Admins can manage tags" ON public.forum_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- FORUM TOPICS TABLE
-- Main discussion threads
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,  -- First post content (markdown)
  preview TEXT,  -- First 200 chars for listings
  
  -- Author & Category
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  
  -- Topic Type Flags
  is_question BOOLEAN DEFAULT false,  -- Q&A format
  is_solved BOOLEAN DEFAULT false,    -- Has accepted answer
  wiki_mode BOOLEAN DEFAULT false,    -- Community-editable first post
  
  -- Moderation Flags
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  
  -- Counters (denormalized for performance)
  posts_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  reactions_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT
);

-- Enable RLS
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

-- Topics are public (for SEO) - but hidden ones only visible to admins
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.forum_topics;
CREATE POLICY "Topics are viewable by everyone" ON public.forum_topics
  FOR SELECT USING (is_hidden = false OR auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.forum_topics;
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own topics" ON public.forum_topics;
CREATE POLICY "Authors can update own topics" ON public.forum_topics
  FOR UPDATE USING (auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author ON public.forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON public.forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_activity ON public.forum_topics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_slug ON public.forum_topics(slug);

-- =====================================================
-- FORUM TOPIC TAGS (Junction Table)
-- Many-to-many relationship between topics and tags
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_topic_tags (
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.forum_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.forum_topic_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Topic tags are viewable by everyone" ON public.forum_topic_tags;
CREATE POLICY "Topic tags are viewable by everyone" ON public.forum_topic_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authors can manage topic tags" ON public.forum_topic_tags;
CREATE POLICY "Authors can manage topic tags" ON public.forum_topic_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.forum_topics WHERE id = topic_id AND author_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- FORUM POSTS TABLE
-- Replies and comments on topics
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL,  -- Markdown content
  
  -- Reply threading (optional - for nested replies)
  parent_id UUID REFERENCES public.forum_posts(id) ON DELETE SET NULL,
  
  -- Solution marking (for Q&A topics)
  is_solution BOOLEAN DEFAULT false,
  
  -- Moderation
  is_hidden BOOLEAN DEFAULT false,
  
  -- Counters
  reactions_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Posts are public (for SEO)
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.forum_posts;
CREATE POLICY "Posts are viewable by everyone" ON public.forum_posts
  FOR SELECT USING (is_hidden = false OR auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own posts" ON public.forum_posts;
CREATE POLICY "Authors can update own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON public.forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at);

-- =====================================================
-- FORUM REACTIONS TABLE
-- Emoji reactions to posts
-- Reactions: 👍 Like, ❤️ Love, 🎯 Helpful, 🧠 Insightful, 💡 Creative
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,  -- For reacting to first post
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Reaction type
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'helpful', 'insightful', 'creative')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one reaction type per user per post/topic
  UNIQUE(post_id, user_id, reaction_type),
  UNIQUE(topic_id, user_id, reaction_type),
  
  -- Must have either post_id or topic_id
  CHECK (post_id IS NOT NULL OR topic_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.forum_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.forum_reactions;
CREATE POLICY "Reactions are viewable by everyone" ON public.forum_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can react" ON public.forum_reactions;
CREATE POLICY "Authenticated users can react" ON public.forum_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove own reactions" ON public.forum_reactions;
CREATE POLICY "Users can remove own reactions" ON public.forum_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_reactions_post ON public.forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_topic ON public.forum_reactions(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_user ON public.forum_reactions(user_id);

-- =====================================================
-- FORUM MENTIONS TABLE
-- @username mentions for notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  mentioned_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentioning_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, mentioned_user_id)
);

-- Enable RLS
ALTER TABLE public.forum_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view mentions of themselves" ON public.forum_mentions;
CREATE POLICY "Users can view mentions of themselves" ON public.forum_mentions
  FOR SELECT USING (auth.uid() = mentioned_user_id OR auth.uid() = mentioning_user_id);

DROP POLICY IF EXISTS "Authenticated users can create mentions" ON public.forum_mentions;
CREATE POLICY "Authenticated users can create mentions" ON public.forum_mentions
  FOR INSERT WITH CHECK (auth.uid() = mentioning_user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_forum_mentions_user ON public.forum_mentions(mentioned_user_id);

-- =====================================================
-- FORUM WIKI EDITS TABLE
-- History of wiki post edits
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_wiki_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  editor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Content diff
  previous_content TEXT NOT NULL,
  new_content TEXT NOT NULL,
  edit_summary TEXT,
  
  -- Status
  is_approved BOOLEAN DEFAULT true,  -- Auto-approve for veterans
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_wiki_edits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Wiki edits are viewable by everyone" ON public.forum_wiki_edits;
CREATE POLICY "Wiki edits are viewable by everyone" ON public.forum_wiki_edits
  FOR SELECT USING (is_approved = true OR auth.uid() = editor_id);

DROP POLICY IF EXISTS "Veterans can create wiki edits" ON public.forum_wiki_edits;
CREATE POLICY "Veterans can create wiki edits" ON public.forum_wiki_edits
  FOR INSERT WITH CHECK (
    auth.uid() = editor_id AND
    EXISTS (
      SELECT 1 FROM public.user_levels 
      WHERE user_id = auth.uid() AND level >= 6
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_wiki_edits_topic ON public.forum_wiki_edits(topic_id);

-- =====================================================
-- FORUM NOTIFICATIONS TABLE
-- User notifications for forum activity
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification type
  type TEXT NOT NULL CHECK (type IN (
    'mention', 'reply', 'reaction', 'solution', 'wiki_edit', 'achievement'
  )),
  
  -- Related entities
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Who triggered it
  
  -- Content
  title TEXT NOT NULL,
  message TEXT,
  
  -- State
  is_read BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.forum_notifications;
CREATE POLICY "Users can view own notifications" ON public.forum_notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.forum_notifications;
CREATE POLICY "System can create notifications" ON public.forum_notifications
  FOR INSERT WITH CHECK (true);  -- Created by triggers/functions

DROP POLICY IF EXISTS "Users can update own notifications" ON public.forum_notifications;
CREATE POLICY "Users can update own notifications" ON public.forum_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user ON public.forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_unread ON public.forum_notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- FORUM COURSE LINKS TABLE
-- Link topics to courses/lessons
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_course_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  
  -- Link to course system
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Must link to something
  CHECK (topic_id IS NOT NULL OR post_id IS NOT NULL),
  CHECK (course_id IS NOT NULL OR lesson_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.forum_course_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course links are viewable by everyone" ON public.forum_course_links;
CREATE POLICY "Course links are viewable by everyone" ON public.forum_course_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authors can create course links" ON public.forum_course_links;
CREATE POLICY "Authors can create course links" ON public.forum_course_links
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- FORUM PROMPT EMBEDS TABLE
-- Link topics/posts to prompts from library
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_prompt_embeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Must link to topic or post
  CHECK (topic_id IS NOT NULL OR post_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.forum_prompt_embeds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prompt embeds are viewable by everyone" ON public.forum_prompt_embeds;
CREATE POLICY "Prompt embeds are viewable by everyone" ON public.forum_prompt_embeds
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authors can create prompt embeds" ON public.forum_prompt_embeds;
CREATE POLICY "Authors can create prompt embeds" ON public.forum_prompt_embeds
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- FORUM VIEWS TABLE
-- Track topic views for popularity & SEO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL for guests
  ip_hash TEXT,  -- Hashed IP for guest uniqueness
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate views in short timeframe
  UNIQUE(topic_id, viewer_id),
  UNIQUE(topic_id, ip_hash)
);

-- Enable RLS
ALTER TABLE public.forum_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Views are insertable" ON public.forum_views;
CREATE POLICY "Views are insertable" ON public.forum_views
  FOR INSERT WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_forum_views_topic ON public.forum_views(topic_id);

-- =====================================================
-- FORUM USER STATS TABLE
-- Denormalized stats for user profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.forum_user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  topics_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  solutions_count INTEGER DEFAULT 0,
  reactions_received INTEGER DEFAULT 0,
  wiki_edits_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Forum stats are viewable by everyone" ON public.forum_user_stats;
CREATE POLICY "Forum stats are viewable by everyone" ON public.forum_user_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can manage forum stats" ON public.forum_user_stats;
CREATE POLICY "System can manage forum stats" ON public.forum_user_stats
  FOR ALL USING (true);

-- =====================================================
-- SEED DATA: Initial Categories
-- =====================================================
INSERT INTO public.forum_categories (slug, name, description, icon, color, order_index)
VALUES 
  ('ai-automations', 'AI & Автоматизации', 'Дискусии за AI инструменти, автоматизация и workflow оптимизация', '🤖', '#8B5CF6', 1),
  ('courses-resources', 'Курсове & Ресурси', 'Въпроси и дискусии за курсовете в платформата', '📚', '#10B981', 2),
  ('ideas-projects', 'Идеи & Проекти', 'Showcase на потребителски проекти и споделяне на идеи', '💡', '#F59E0B', 3),
  ('questions', 'Въпроси', 'Общи въпроси за AI и търсене на помощ', '❓', '#EF4444', 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- =====================================================
-- SEED DATA: Forum Achievements
-- =====================================================
INSERT INTO public.achievements (code, name, description, icon, tier, xp_reward)
VALUES 
  ('forum_first_post', 'First Voice', 'Публикувай първия си пост във форума', '🗣️', 1, 50),
  ('forum_conversationalist', 'Conversationalist', 'Публикувай 10 поста във форума', '💬', 2, 100),
  ('forum_community_helper', 'Community Helper', 'Получи 50 Helpful реакции', '🌟', 3, 200),
  ('forum_wiki_contributor', 'Wiki Contributor', 'Направи 5 wiki редакции', '📝', 2, 150),
  ('forum_streak_7', 'Forum Fire', '7 дни последователна активност във форума', '🔥', 2, 100),
  ('forum_problem_solver', 'Problem Solver', 'Твой отговор избран като решение 10 пъти', '✅', 3, 250)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  xp_reward = EXCLUDED.xp_reward;

-- =====================================================
-- SEED DATA: Starter Topics (Pinned)
-- These prevent the "empty forum" feeling
-- =====================================================

-- Note: You need to run this AFTER creating an admin user
-- Replace 'ADMIN_USER_ID' with the actual admin UUID

DO $$
DECLARE
  admin_id UUID;
  questions_cat_id UUID;
  ai_cat_id UUID;
BEGIN
  -- Get first admin user or any user as fallback
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.profiles LIMIT 1;
  END IF;
  
  -- Get category IDs
  SELECT id INTO questions_cat_id FROM public.forum_categories WHERE slug = 'questions';
  SELECT id INTO ai_cat_id FROM public.forum_categories WHERE slug = 'ai-automations';
  
  IF admin_id IS NOT NULL THEN
    -- 1. Forum Rules
    INSERT INTO public.forum_topics (slug, title, content, preview, author_id, category_id, is_pinned, wiki_mode)
    VALUES (
      'rules',
      '📋 Правила на форума',
      E'# Добре дошли в CyberNinjas Форума!\n\nТук споделяме знания, задаваме въпроси и помагаме един на друг в света на AI.\n\n## Основни правила\n\n1. **Бъди уважителен** – Всеки започва от някъде\n2. **Споделяй стойност** – Конкретни примери > общи съвети\n3. **Търси преди да питаш** – Може би вече има отговор\n4. **Форматирай добре** – Markdown помага на всички\n5. **Без спам** – Само релевантно съдържание\n\n## Как да получаваш помощ по-бързо\n\n- Опиши какво искаш да постигнеш\n- Покажи какво вече си пробвал\n- Добави примери или скрийншоти\n\nПриятно общуване! 🚀',
      'Добре дошли в CyberNinjas Форума! Тук споделяме знания, задаваме въпроси и помагаме един на друг в света на AI.',
      admin_id,
      questions_cat_id,
      true,
      true
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- 2. How to ask good questions
    INSERT INTO public.forum_topics (slug, title, content, preview, author_id, category_id, is_pinned, is_question)
    VALUES (
      'how-to-ask',
      '❓ Как да задаваме добри въпроси за AI',
      E'# Как да получаваш по-бърз и по-добър отговор\n\nДобрият въпрос е наполовина решен проблем.\n\n## Структура на добър въпрос\n\n### 1. Контекст\nКакво се опитваш да постигнеш? За какъв проект/задача става въпрос?\n\n### 2. Какво пробва\nПокажи какви стъпки вече предприе. Включи промпти, код или примери.\n\n### 3. Какво се случи\nОпиши резултата. Грешка? Неочакван резултат? Бъди конкретен.\n\n### 4. Какво очакваш\nКакъв е желаният резултат?\n\n## Примерен добър въпрос\n\n> "Използвам ChatGPT за генериране на имейли за клиенти. Промптът ми е: [промпт]. Резултатът е твърде дълъг и формален. Как мога да го направя по-кратък и приятелски?"\n\n## Лош въпрос\n\n> "ChatGPT не работи добре, помогнете"\n\nДавай конкретика! 💪',
      'Добрият въпрос е наполовина решен проблем. Научи как да структурираш въпросите си за по-бърз и полезен отговор.',
      admin_id,
      questions_cat_id,
      true,
      false
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- 3. Introductions
    INSERT INTO public.forum_topics (slug, title, content, preview, author_id, category_id, is_pinned)
    VALUES (
      'introductions',
      '👋 Представете се тук',
      E'# Здравейте, нови нинджи!\n\nТова е мястото да се представите на общността.\n\n## Споделете за себе си\n\n- Как се казваш? (или nickname)\n- Каква е професията/интересите ти?\n- Какво те привлече към AI?\n- Какво се надяваш да научиш?\n\n## Защо да се представяш?\n\nКогато хората те познават, е по-лесно да:\n- Получаваш relevant помощ\n- Намираш хора със сходни интереси\n- Изграждаш connections\n\nДобре дошъл в общността! 🥷',
      'Кажи здравей на общността! Представи се и сподели какво те интересува в света на AI.',
      admin_id,
      ai_cat_id,
      true
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- 4. Project Ideas
    INSERT INTO public.forum_topics (slug, title, content, preview, author_id, category_id, is_pinned)
    VALUES (
      'project-ideas',
      '💡 Идеи за AI проекти – вдъхновение за начинаещи',
      E'# Търсиш идея за AI проект?\n\nЕто някои идеи за различни нива:\n\n## 🌱 За начинаещи\n\n- **AI Помощник за имейли** – Използвай ChatGPT API за генериране на отговори\n- **Генератор на социални постове** – Автоматизирай content creation\n- **Summarizer** – Обобщавай дълги статии или документи\n\n## 🌿 Средно ниво\n\n- **Chatbot за бизнес** – RAG базиран асистент за FAQ\n- **Автоматизация на workflow** – Свързване на различни инструменти\n- **AI Image Generator** – Midjourney/DALL-E интеграция\n\n## 🌳 Напреднали\n\n- **Custom AI Agent** – Multi-step reasoning и tool use\n- **Fine-tuned модел** – Специализиран за твоя domain\n- **Full-stack AI App** – Production-ready приложение\n\n---\n\n**Сподели своята идея или проект в коментарите!** 👇',
      'Вдъхновение за AI проекти – от начинаещи до напреднали. Сподели своята идея!',
      admin_id,
      ai_cat_id,
      true
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- Update category topic counts
    UPDATE public.forum_categories SET topics_count = (
      SELECT COUNT(*) FROM public.forum_topics WHERE category_id = public.forum_categories.id
    );
    
  END IF;
END $$;

-- =====================================================
-- FUNCTIONS: XP Rewards for Forum Actions
-- =====================================================

-- Function to award XP
CREATE OR REPLACE FUNCTION public.award_forum_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_action TEXT
)
RETURNS void AS $$
BEGIN
  -- Update or insert user level record
  INSERT INTO public.user_levels (user_id, xp, updated_at)
  VALUES (p_user_id, p_xp_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = public.user_levels.xp + p_xp_amount,
    updated_at = NOW();
    
  -- Check for level up (every 100 XP = 1 level)
  UPDATE public.user_levels
  SET level = GREATEST(1, FLOOR(xp / 100) + 1)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Award XP when creating topic (+10 XP)
CREATE OR REPLACE FUNCTION public.on_forum_topic_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.award_forum_xp(NEW.author_id, 10, 'topic_created');
  
  -- Update user stats
  INSERT INTO public.forum_user_stats (user_id, topics_count)
  VALUES (NEW.author_id, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    topics_count = public.forum_user_stats.topics_count + 1,
    updated_at = NOW();
    
  -- Update category count
  UPDATE public.forum_categories
  SET topics_count = topics_count + 1
  WHERE id = NEW.category_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_forum_topic_created ON public.forum_topics;
CREATE TRIGGER trigger_forum_topic_created
  AFTER INSERT ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION public.on_forum_topic_created();

-- Trigger: Award XP when creating post (+5 XP)
CREATE OR REPLACE FUNCTION public.on_forum_post_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.award_forum_xp(NEW.author_id, 5, 'post_created');
  
  -- Update user stats
  INSERT INTO public.forum_user_stats (user_id, posts_count)
  VALUES (NEW.author_id, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    posts_count = public.forum_user_stats.posts_count + 1,
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

DROP TRIGGER IF EXISTS trigger_forum_post_created ON public.forum_posts;
CREATE TRIGGER trigger_forum_post_created
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.on_forum_post_created();

-- Trigger: Award XP for reactions (+2 XP, +15 for Helpful)
CREATE OR REPLACE FUNCTION public.on_forum_reaction_created()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  topic_author_id UUID;
  xp_amount INTEGER;
BEGIN
  -- Determine XP amount based on reaction type
  xp_amount := CASE 
    WHEN NEW.reaction_type = 'helpful' THEN 15
    ELSE 2
  END;
  
  -- Find the author to reward
  IF NEW.post_id IS NOT NULL THEN
    SELECT author_id INTO post_author_id FROM public.forum_posts WHERE id = NEW.post_id;
    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
      PERFORM public.award_forum_xp(post_author_id, xp_amount, 'reaction_received');
      
      -- Update reaction count on post
      UPDATE public.forum_posts SET reactions_count = reactions_count + 1 WHERE id = NEW.post_id;
      
      -- Update user stats
      UPDATE public.forum_user_stats 
      SET reactions_received = reactions_received + 1, updated_at = NOW()
      WHERE user_id = post_author_id;
      
      -- Create notification
      INSERT INTO public.forum_notifications (user_id, type, post_id, actor_id, title, message)
      VALUES (
        post_author_id,
        'reaction',
        NEW.post_id,
        NEW.user_id,
        'Нова реакция',
        'Получи ' || 
          CASE NEW.reaction_type 
            WHEN 'like' THEN '👍'
            WHEN 'love' THEN '❤️'
            WHEN 'helpful' THEN '🎯'
            WHEN 'insightful' THEN '🧠'
            WHEN 'creative' THEN '💡'
          END || ' реакция'
      );
    END IF;
  ELSIF NEW.topic_id IS NOT NULL THEN
    SELECT author_id INTO topic_author_id FROM public.forum_topics WHERE id = NEW.topic_id;
    IF topic_author_id IS NOT NULL AND topic_author_id != NEW.user_id THEN
      PERFORM public.award_forum_xp(topic_author_id, xp_amount, 'reaction_received');
      
      -- Update reaction count on topic
      UPDATE public.forum_topics SET reactions_count = reactions_count + 1 WHERE id = NEW.topic_id;
      
      -- Update user stats
      UPDATE public.forum_user_stats 
      SET reactions_received = reactions_received + 1, updated_at = NOW()
      WHERE user_id = topic_author_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_forum_reaction_created ON public.forum_reactions;
CREATE TRIGGER trigger_forum_reaction_created
  AFTER INSERT ON public.forum_reactions
  FOR EACH ROW EXECUTE FUNCTION public.on_forum_reaction_created();

-- Trigger: Award XP when post marked as solution (+20 XP)
CREATE OR REPLACE FUNCTION public.on_solution_marked()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when is_solution changes to true
  IF NEW.is_solution = true AND (OLD.is_solution = false OR OLD.is_solution IS NULL) THEN
    -- Award XP to the post author
    PERFORM public.award_forum_xp(NEW.author_id, 20, 'solution_marked');
    
    -- Update user stats
    UPDATE public.forum_user_stats 
    SET solutions_count = solutions_count + 1, updated_at = NOW()
    WHERE user_id = NEW.author_id;
    
    -- Mark topic as solved
    UPDATE public.forum_topics SET is_solved = true WHERE id = NEW.topic_id;
    
    -- Create notification
    INSERT INTO public.forum_notifications (user_id, type, topic_id, post_id, title, message)
    VALUES (
      NEW.author_id,
      'solution',
      NEW.topic_id,
      NEW.id,
      'Отговорът ти е избран като решение! 🎉',
      'Получаваш +20 XP!'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_solution_marked ON public.forum_posts;
CREATE TRIGGER trigger_solution_marked
  AFTER UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.on_solution_marked();

-- =====================================================
-- FUNCTION: Get Trust Level from User Level
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_forum_trust_level(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_level INTEGER;
BEGIN
  SELECT level INTO user_level FROM public.user_levels WHERE user_id = p_user_id;
  
  IF user_level IS NULL THEN
    RETURN 1;  -- Default to Novice
  ELSIF user_level >= 10 THEN
    RETURN 4;  -- Moderator
  ELSIF user_level >= 6 THEN
    RETURN 3;  -- Veteran
  ELSIF user_level >= 3 THEN
    RETURN 2;  -- Member
  ELSE
    RETURN 1;  -- Novice
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEW: Forum Topics with Author Info
-- Optimized view for topic listings
-- =====================================================
CREATE OR REPLACE VIEW public.forum_topics_view AS
SELECT 
  t.*,
  p.name AS author_name,
  p.avatar_url AS author_avatar,
  ul.level AS author_level,
  public.get_forum_trust_level(t.author_id) AS author_trust_level,
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon,
  ARRAY(
    SELECT tag.name FROM public.forum_tags tag
    JOIN public.forum_topic_tags tt ON tt.tag_id = tag.id
    WHERE tt.topic_id = t.id
  ) AS tags
FROM public.forum_topics t
LEFT JOIN public.profiles p ON t.author_id = p.id
LEFT JOIN public.user_levels ul ON t.author_id = ul.user_id
LEFT JOIN public.forum_categories c ON t.category_id = c.id;

COMMENT ON TABLE public.forum_categories IS 'Forum discussion categories (3-4 max)';
COMMENT ON TABLE public.forum_topics IS 'Forum discussion topics/threads';
COMMENT ON TABLE public.forum_posts IS 'Replies to forum topics';
COMMENT ON TABLE public.forum_reactions IS 'Emoji reactions to posts/topics';
COMMENT ON TABLE public.forum_notifications IS 'User notifications for forum activity';
