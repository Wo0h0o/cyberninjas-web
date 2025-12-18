-- =====================================================
-- CYBERNINJAS DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS and DROP IF EXISTS)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'paid')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (drop first if exists)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COURSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price_bgn INTEGER DEFAULT 299,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses policies (drop first if exists)
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone" ON public.courses
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- MODULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Modules policies (drop first if exists)
DROP POLICY IF EXISTS "Modules are viewable if course is published" ON public.modules;
CREATE POLICY "Modules are viewable if course is published" ON public.modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_published = true)
  );

DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- LESSONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  content_html TEXT,
  is_free_preview BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons policies (drop first if exists)
DROP POLICY IF EXISTS "Lessons are viewable if course is published" ON public.lessons;
CREATE POLICY "Lessons are viewable if course is published" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      WHERE m.id = module_id AND c.is_published = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- USER PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  video_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- User progress policies (drop first if exists)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  stripe_payment_id TEXT,
  amount_bgn INTEGER NOT NULL,
  source TEXT DEFAULT 'stripe' CHECK (source IN ('stripe', 'manual', 'referral')),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Purchases policies (drop first if exists)
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA: Initial Courses
-- =====================================================
INSERT INTO public.courses (slug, title, description, price_bgn, order_index, is_published)
VALUES 
  ('dna-protocol', 'DNA Protocol', 'Накарай AI да работи вместо теб. Основите на Prompt Engineering – научи се да комуникираш ефективно с AI модели.', 299, 1, true),
  ('visual-godmode', 'Visual Godmode', 'Създавай видеа за бизнеса си за 10 минути. AI Video & Image генерация за маркетинг материали без дизайнер.', 299, 2, true),
  ('orchestrator', 'Orchestrator', 'Върни си 20 часа седмично. Workflow automation – свържи всичките си инструменти в един поток.', 299, 3, true),
  ('crypto-mastery', 'Crypto Mastery', 'Разбери blockchain преди конкуренцията. Web3 експертиза от основи до advanced стратегии.', 299, 4, true)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEED DATA: Example Modules for DNA Protocol
-- =====================================================
INSERT INTO public.modules (course_id, title, order_index)
SELECT c.id, m.title, m.order_index
FROM public.courses c
CROSS JOIN (
  VALUES 
    ('Въведение в AI', 1),
    ('Основи на Prompt Engineering', 2),
    ('Advanced Techniques', 3),
    ('Практически проекти', 4)
) AS m(title, order_index)
WHERE c.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Example Lessons
-- =====================================================
INSERT INTO public.lessons (module_id, title, description, duration_seconds, is_free_preview, order_index)
SELECT m.id, l.title, l.description, l.duration, l.is_preview, l.order_index
FROM public.modules m
JOIN public.courses c ON m.course_id = c.id
CROSS JOIN (
  VALUES 
    ('Какво е AI и защо има значение', 'Преглед на AI революцията и какво означава за теб', 600, true, 1),
    ('Как работят езиковите модели', 'Технически основи без сложна математика', 900, true, 2),
    ('Първият ти промпт', 'Практическо упражнение с ChatGPT', 720, false, 3)
) AS l(title, description, duration, is_preview, order_index)
WHERE c.slug = 'dna-protocol' AND m.title = 'Въведение в AI'
ON CONFLICT DO NOTHING;

-- =====================================================
-- PROMPT LIBRARIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.prompt_libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  introduction TEXT, -- Introductory narrative (markdown)
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prompt_libraries ENABLE ROW LEVEL SECURITY;

-- Prompt libraries policies
DROP POLICY IF EXISTS "Prompt libraries are viewable by everyone" ON public.prompt_libraries;
CREATE POLICY "Prompt libraries are viewable by everyone" ON public.prompt_libraries
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage prompt libraries" ON public.prompt_libraries;
CREATE POLICY "Admins can manage prompt libraries" ON public.prompt_libraries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- LIBRARY MODULES TABLE (NEW - chapters/modules)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_id UUID REFERENCES public.prompt_libraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  introduction TEXT, -- Module intro (markdown)
  icon TEXT, -- Optional icon/emoji
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.library_modules ENABLE ROW LEVEL SECURITY;

-- Modules viewable if library is published
DROP POLICY IF EXISTS "Modules are viewable if library is published" ON public.library_modules;
CREATE POLICY "Modules are viewable if library is published" ON public.library_modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prompt_libraries WHERE id = library_id AND is_published = true)
  );

DROP POLICY IF EXISTS "Admins can manage library modules" ON public.library_modules;
CREATE POLICY "Admins can manage library modules" ON public.library_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- MODULE SECTIONS TABLE (NEW - narrative content)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.module_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.library_modules(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL, -- Markdown content
  section_type TEXT DEFAULT 'narrative' CHECK (section_type IN ('narrative', 'instructions', 'example', 'warning')),
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;

-- Sections viewable if library is published
DROP POLICY IF EXISTS "Sections are viewable if library is published" ON public.module_sections;
CREATE POLICY "Sections are viewable if library is published" ON public.module_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.library_modules m
      JOIN public.prompt_libraries l ON m.library_id = l.id
      WHERE m.id = module_id AND l.is_published = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage module sections" ON public.module_sections;
CREATE POLICY "Admins can manage module sections" ON public.module_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- PROMPT CATEGORIES TABLE (MODIFIED - links to module)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.prompt_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.library_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.prompt_categories ENABLE ROW LEVEL SECURITY;

-- Categories viewable if library is published
DROP POLICY IF EXISTS "Categories are viewable if library is published" ON public.prompt_categories;
CREATE POLICY "Categories are viewable if library is published" ON public.prompt_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.library_modules m
      JOIN public.prompt_libraries l ON m.library_id = l.id
      WHERE m.id = module_id AND l.is_published = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage prompt categories" ON public.prompt_categories;
CREATE POLICY "Admins can manage prompt categories" ON public.prompt_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- PROMPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.prompt_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  description TEXT,
  usage_tips TEXT,
  expected_result TEXT, -- What to expect when using this prompt
  tags TEXT[],
  is_premium BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Prompts viewable if library is published
DROP POLICY IF EXISTS "Prompts are viewable if library is published" ON public.prompts;
CREATE POLICY "Prompts are viewable if library is published" ON public.prompts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.prompt_categories c
      JOIN public.library_modules m ON c.module_id = m.id
      JOIN public.prompt_libraries l ON m.library_id = l.id
      WHERE c.id = category_id AND l.is_published = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage prompts" ON public.prompts;
CREATE POLICY "Admins can manage prompts" ON public.prompts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- USER FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, prompt_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can manage own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
CREATE POLICY "Users can insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA: DNA Protocol Prompt Library
-- =====================================================
INSERT INTO public.prompt_libraries (slug, title, description, introduction, is_premium, is_published, order_index)
VALUES (
  'dna-protocol',
  'The AI Architect: DNA Protocol',
  'Оперативен наръчник за изграждане на персонализирани AI агенти',
  '## КЛЕТВАТА: ОТ ПОТРЕБИТЕЛ КЪМ АРХИТЕКТ

Вие държите в ръцете си не просто наръчник. Държите архитектурен план.

До този момент сте взаимодействали с Изкуствения Интелект като **ПОТРЕБИТЕЛ**. Задавали сте въпроси. Получавали сте отговори. Консумирали сте информация. Това е пасивна роля. Ролята на 99% от хората.

**Днес това свършва.**

От този момент нататък, вие ставате **АРХИТЕКТ**.

Архитектът не консумира. Той проектира. Той не моли за отговори. Той конструира системи за мислене. Той не използва инструмента. Той го калибрира. Той го превръща в оръжие.

Вие не сте тук, за да питате. Вие сте тук, за да командвате.

Този документ е вашият първи ден като Архитект. Прочетете го. Изпълнете го. И се присъединете към 1%, които не следват бъдещето, а го създават.',
  false,
  true,
  1
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  introduction = EXCLUDED.introduction;

-- =====================================================
-- SEED DATA: DNA Protocol Modules
-- =====================================================

-- Module 1: Пробуждането
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'МОДУЛ 1: ПРОБУЖДАНЕТО', 'ТЕОРИЯТА',
'Това е фазата, която 99% от хората пропускат и затова се провалят. За да превърнем генеричния асистент в елитен оперативен агент, ние трябва първо да разберем защо AI "по подразбиране" е проектиран с вроден недостатък.',
'🧠', 1
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- Module 2: Извличането
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'МОДУЛ 2: ИЗВЛИЧАНЕТО', 'ДЕЙСТВИЕ',
'**STATUS: CRITICAL**

Това е фазата, която 99% от хората пропускат и затова се провалят. Те се опитват да напишат инструкциите "на око". Резултатът е слаб, защото ние често не осъзнаваме собствените си процеси и ценности. За да програмираме AI, първо трябва да "хакнем" собствения си мозък.',
'⚡', 2
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- Module 3: Кодирането
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'МОДУЛ 3: КОДИРАНЕТО', 'КОНСТРУКЦИЯ',
'Тук превръщаме вашия "DIGITAL DNA REPORT" в изпълним код. Изберете **ЕДИН** от трите архетипа, който най-добре отговаря на основната ви роля.',
'🔧', 3
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- Module 4: Бойният Протокол
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'МОДУЛ 4: БОЙНИЯТ ПРОТОКОЛ', 'ДИСЦИПЛИНА',
'Това е модулното меню, което се добавя **СЛЕД** кода на вашия Архетип. То контролира "вкуса" и поведението на отговора.

**ИНСТРУКЦИИ:** Изберете по ЕДНА опция от Тон и Формат, и добавете ЦЕЛИЯ модул с Ограничения.',
'⚔️', 4
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- Module 5: Инсталация
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'МОДУЛ 5: ИНСТАЛАЦИЯ', 'ТЕХНИЧЕСКА ЧАСТ',
'Следвайте тези стъпки прецизно. Грешна инсталация води до слаби резултати.',
'💻', 5
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- Module 6: Калибрация
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'МОДУЛ 6: КАЛИБРАЦИЯ И АКТИВАЦИЯ', 'БОЙНИ ДЕЙСТВИЯ',
'Копи-пейстът е само началото. Вашият нов агент е като новобранец – има нужда от тест под напрежение.',
'🎯', 6
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- Bonus Module: Дълбокото гмуркане
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'БОНУС МОДУЛ: ДЪЛБОКОТО ГМУРКАНЕ', 'THE DEEP DIVE',
'Ако искате вашият AI агент да чете мислите ви, не е достатъчно да му дадете само работна характеристика. Трябва да му дадете достъп до вашата операционна логика, страхове и предразсъдъци.

Това е **"The Context Injector"**. Това е скрипт, който кара AI да ви зададе **20 критични въпроса**, които масовият потребител никога не обсъжда.',
'🌊', 7
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- Final Module: Оперативен Старт
INSERT INTO public.library_modules (library_id, title, subtitle, introduction, icon, order_index)
SELECT l.id, 'ОПЕРАТИВЕН СТАРТ', 'DEPLOYMENT',
'Вече имате системата. ДНК-то е внедрено. Сега е време да събудите агента.',
'🚀', 8
FROM public.prompt_libraries l WHERE l.slug = 'dna-protocol'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Module Sections (Narrative Content)
-- =====================================================

-- Module 1 Sections: Пробуждането
INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'Фундаменталният недостатък на AI "по подразбиране"',
'Всеки AI модел, с който работите "out of the box", е проектиран с един основен, вроден недостатък: той е създаден да угажда на всички. Той е "средностатистическият асистент" – любезен, предпазлив и ужасно скучен.

Когато го попитате за бизнес съвет, той ви дава това, което би дал на милион други хора. Когато го помолите за маркетинг копи, той ви дава клишета.

Защо? Защото той страда от два критични синдрома:

1. **Контекстуален Вакуум:** AI няма вашата памет. Той не знае вашите цели, вашите клиенти, вашите предишни победи и провали. В този вакуум, той може само да гадае, разчитайки на средната стойност от милиардите страници в интернет. Резултатът е генеричен шум.

2. **Синдром на Угодничеството (The Sycophancy Syndrome):** AI е фино настроен да бъде безопасен и да избягва конфронтация. Той ще предпочете да ви даде "мек" и политически коректен отговор, вместо бруталната истина, от която се нуждаете, за да успеете. Той е програмиран да бъде асистент, а вие имате нужда от **стратег**.',
'narrative', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 1%'
ON CONFLICT DO NOTHING;

INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'Решението: The DNA Protocol',
'За да превърнем този генеричен асистент в елитен оперативен агент, ние не го "промптваме". Ние го **програмираме на системно ниво**. Правим го чрез инжектиране на две основни директиви:

* **Дигиталното ДНК (The Core Code):** Това е **стратегическият контекст**. Това е съвкупността от вашия опит, вашите ценности, вашия уникален глас и вашите стратегически цели. Това е кодът, който прави вашия бизнес *вашият* бизнес.

* **Бойният Протокол (The Combat Protocol):** Това е **оперативната рамка**. Това е дисциплината. Това са строгите правила за това как AI трябва да говори, как да форматира информация и какво му е АБСОЛЮТНО забранено.

Комбинацията от двете е единственият начин да се изгради истински полезен AI. Всичко друго е игра.',
'narrative', 2
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 1%'
ON CONFLICT DO NOTHING;

-- Module 2 Sections: Извличането
INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'The Mirror Session (Огледалната Сесия)',
'Преди да отворите настройките на AI, трябва да направите одит на себе си. Трябва да извлечете информацията, която стои в подсъзнанието ви. За да не гледате белия лист, създадохме специален "Журналистически Промпт", който ще свърши тежката работа вместо вас.',
'narrative', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 2%'
ON CONFLICT DO NOTHING;

INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'Как да използвате The Extraction Prompt',
'1. Отворете **НОВ, "чист" чат** в ChatGPT, Claude или Gemini.
2. Копирайте **ЦЕЛИЯ код** от промпта по-долу.
3. Поставете го в чата и натиснете Enter.
4. Отговаряйте на въпросите на AI подробно. Множество примери и изречения! Развихри се!
5. Накрая AI ще обобщи всичко в структуриран доклад. **ЗАПАЗЕТЕ ТОЗИ ДОКЛАД!** Той е суровият материал за следващия модул.

*Можете накрая да добавите опция да ви говори на български, за да общувате по-лесно, в случай, че ви е трудно на английски език.*',
'instructions', 2
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 2%'
ON CONFLICT DO NOTHING;

-- Module 5 Sections: Инсталация
INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'За Google AI Studio (ПРЕПОРЪЧИТЕЛНО)',
'1. Отворете **aistudio.google.com**.
2. Създайте нов чат (**"Create new"** -> **"Freestyle prompt"**).
3. Намерете полето **"System instructions"** в горната част на интерфейса.
4. Поставете **ЦЕЛИЯ СИ КОД** (Архетип + Боен Протокол) в това поле.
5. Настройте **"Temperature"** вдясно: **0.2** за Analyst, **0.7** за Strategist, **1.0** за Creator.',
'instructions', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 5%'
ON CONFLICT DO NOTHING;

INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'За ChatGPT (Plus/Team/Enterprise)',
'1. Кликнете на профила си -> **"Settings"** -> **"Personalization"**.
2. Активирайте **"Custom Instructions"**.
3. Ще видите две полета:
   * *Горно поле* ("What would you like ChatGPT to know about you?"): Поставете **само** секция **[CONTEXT]** от вашия Архетип.
   * *Долно поле* ("How would you like ChatGPT to respond?"): Поставете **ВСИЧКО ОСТАНАЛО** (Role, Directives, Combat Protocol).
4. Натиснете **"Save"**.',
'instructions', 2
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 5%'
ON CONFLICT DO NOTHING;

INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'За Claude (Pro)',
'Най-добрият начин е чрез System Prompt в началото на всеки нов чат.
Преди първия си въпрос, поставете целия си код, ограден в тагове:

```
<system_instructions>
[ПОСТАВЕТЕ ЦЕЛИЯ СИ КОД ТУК]
</system_instructions>
```

Най-удачно е да тествате различни архетипи, с вашите настройки, за да видите, кой тип отговори всъщност най-добре ви прилягат!',
'instructions', 3
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 5%'
ON CONFLICT DO NOTHING;

-- Module 6 Sections: Калибрация
INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'The Stress Test (Стрес Тестът)',
'Веднага след като активирате инструкциите, пуснете стрес теста в нов чат, за да видите дали системата работи.

**ОЧАКВАН РЕЗУЛТАТ:**

* ❌ **ПРОВАЛ:** *"That''s an interesting idea, but it''s important to consider..."* (Твърде мек).
* ✅ **УСПЕХ:** *"KPI VIOLATION: This idea fails the ROI directive. High operational costs vs. low defensible margin. Here are 3 reasons to kill this idea immediately..."* (Директен).',
'instructions', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 6%'
ON CONFLICT DO NOTHING;

INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'The Genesis Prompts (Активация за ROI)',
'Системата е калибрирана. Време е за резултати. **СЕГА.**',
'narrative', 2
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 6%'
ON CONFLICT DO NOTHING;

-- Оперативен Старт Section
INSERT INTO public.module_sections (module_id, title, content, section_type, order_index)
SELECT m.id, 'Финални думи: Добре дошли в 1%',
'Вие вече не сте потребител. Вие сте Архитект на Дигитален Интелект.
Системата е инсталирана. Тя е жива. Тя има вашето ДНК.
Тя не е просто инструмент. Тя е вашето стратегическо продължение. Мултипликатор на вашата воля.

**Вашата нова реалност:**

* Няма повече "започване от нулата": Вие вече сте редактор, не писател на чернови.
* Няма повече самота във вземането на решения: Вече имате спаринг партньор, който познава бизнеса ви по-добре от всеки консултант.
* Няма повече творчески хаос: Имате система, която канализира идеите ви в резултати.

**Една последна директива:** Не пазете този инструмент за "специални случаи". Използвайте го до счупване. Предизвиквайте го. Карайте го да работи, докато вие спите.

Добре дошли в ерата на Хибридния Интелект. Сега... отидете и създайте нещо велико.',
'narrative', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title = 'ОПЕРАТИВЕН СТАРТ'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Categories for Modules
-- =====================================================

-- Category for Module 2: Extraction
INSERT INTO public.prompt_categories (module_id, title, description, order_index)
SELECT m.id, 'Извличане (Extraction)', 'Промптове за извличане на вашето Дигитално ДНК', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 2%'
ON CONFLICT DO NOTHING;

-- Categories for Module 3: Archetypes
INSERT INTO public.prompt_categories (module_id, title, description, order_index)
SELECT m.id, 'Архетип: Стратег', 'За предприемачи, CEO, мениджъри - фокус върху решения и KPI', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 3%'
ON CONFLICT DO NOTHING;

INSERT INTO public.prompt_categories (module_id, title, description, order_index)
SELECT m.id, 'Архетип: Творец', 'За маркетолози, копирайтъри - фокус върху емоция и стил', 2
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 3%'
ON CONFLICT DO NOTHING;

INSERT INTO public.prompt_categories (module_id, title, description, order_index)
SELECT m.id, 'Архетип: Анализатор', 'За програмисти, финансисти - фокус върху данни и точност', 3
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 3%'
ON CONFLICT DO NOTHING;

-- Category for Module 4: Combat Protocol
INSERT INTO public.prompt_categories (module_id, title, description, order_index)
SELECT m.id, 'Боен Протокол', 'Контролира тона и формата на отговорите', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 4%'
ON CONFLICT DO NOTHING;

-- Category for Module 6: Activation
INSERT INTO public.prompt_categories (module_id, title, description, order_index)
SELECT m.id, 'Активация', 'Промптове за стрес тест и ROI резултати', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'МОДУЛ 6%'
ON CONFLICT DO NOTHING;

-- Category for Bonus Module: Deep Dive
INSERT INTO public.prompt_categories (module_id, title, description, order_index)
SELECT m.id, 'Context Injector', 'Психологическо профилиране за телепатична точност', 1
FROM public.library_modules m
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND m.title LIKE 'БОНУС%'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Prompts
-- =====================================================

-- The Extraction Prompt (Module 2)
INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, expected_result, tags, is_premium, order_index)
SELECT c.id, 'The Extraction Prompt',
'ACT AS: Senior Business Analyst & Investigative Journalist.

OBJECTIVE: Your goal is to extract the "Digital DNA" from me (the user) to build a sophisticated AI persona. You need to understand my business, my voice, my values, and my operational logic explicitly.

PROTOCOL:
1. Ask me 10 deep, probing questions, ONE BY ONE. Do not ask them all at once. Wait for my answer before asking the next.
2. The questions should cover:
   - My Core Value Proposition (What do I actually sell/do?)
   - My Target Audience (Who exactly are they? Fears, desires?)
   - My "Unfair Advantage" (Why me? What do I do that no one else does?)
   - My Tone of Voice (Adjectives, keywords I use, words I hate)
   - My Strategic Goals for the next 6-12 months.
   - My Decision-Making Framework (How do I judge success? What are my core principles?)
   - My biggest operational bottlenecks and frustrations.
3. Dig deeper. If I give a vague answer like "I want more growth," challenge me politely with "Be more specific. What does ''growth'' look like in numbers?".
4. AFTER the interview is complete, compile all my answers into a structured summary titled "MY DIGITAL DNA REPORT". The report should have clear headings for each topic covered.

START NOW by asking the first question.',
'Инструмент за извличане на вашето Дигитално ДНК',
'Отворете НОВ чат. Копирайте целия код. Отговаряйте подробно на всеки въпрос. Запазете генерирания DNA REPORT!',
'Структуриран доклад "MY DIGITAL DNA REPORT" с всички аспекти на вашия бизнес и стил.',
ARRAY['extraction', 'interview', 'dna', 'бизнес анализ'],
false, 1
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Извличане (Extraction)'
ON CONFLICT DO NOTHING;

-- The Strategist (Module 3)
INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, tags, is_premium, order_index)
SELECT c.id, 'The Strategist System Instructions',
'### SYSTEM INSTRUCTIONS: THE STRATEGIST ###

[ROLE]
You are my Chief Strategy Officer (CSO). You are not a generic assistant. You are a high-level business consultant patterned after principles of logic, efficiency, and high ROI. Your primary function is to help me make better decisions, faster.

[CONTEXT]
My Business: [ПОПЪЛНЕТЕ ОТ ВАШИЯ "DNA REPORT": Какво правите?]
My Audience (ICP): [ПОПЪЛНЕТЕ: Кой е идеалният ви клиент?]
My Unfair Advantage: [ПОПЪЛНЕТЕ: Вашето уникално предимство?]

[PRIME DIRECTIVES]
1. PRIORITIZE ROI: Always evaluate ideas based on impact vs. effort (80/20 Principle).
2. BE BRUTALLY HONEST: If an idea is weak, tell me why. Do not be a "yes-man". Your loyalty is to the mission, not my ego.
3. THINK IN SYSTEMS: Don''t just give a tactic; explain how it fits into the larger strategic system. Identify potential second and third-order consequences.
4. FOCUS ON KPIs: All analysis must be filtered through my primary Key Performance Indicators:
   - KPI 1: [ВЪВЕДЕТЕ ВАШИЯ KPI 1]
   - KPI 2: [ВЪВЕДЕТЕ ВАШИЯ KPI 2]
   - KPI 3: [ВЪВЕДЕТЕ ВАШИЯ KPI 3]',
'Системни инструкции за стратегически AI агент',
'Попълнете [CONTEXT] секцията с данни от вашия DNA Report. Поставете в System Instructions на избрания AI.',
ARRAY['strategist', 'cso', 'roi', 'kpi', 'бизнес'],
false, 1
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Архетип: Стратег'
ON CONFLICT DO NOTHING;

-- The Creator (Module 3)
INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, tags, is_premium, order_index)
SELECT c.id, 'The Creator System Instructions',
'### SYSTEM INSTRUCTIONS: THE CREATOR ###

[ROLE]
You are my Lead Creative Director and Ghostwriter. You understand human psychology, persuasion, and storytelling deeply. Your purpose is to translate my ideas into compelling content that captures attention and drives action.

[CONTEXT]
My Brand Voice: [ПОПЪЛНЕТЕ ОТ ВАШИЯ "DNA REPORT": Вашият стил - напр. Provocative, Witty, Educational]
My Audience''s Deepest Fears: [ПОПЪЛНЕТЕ: От какво ги е страх?]
My Audience''s Strongest Desires: [ПОПЪЛНЕТЕ: Какво искат най-много?]
Forbidden Words & Phrases: [ПОПЪЛНЕТЕ: Думи, които мразите - напр. "Unlock your potential", "Game-changer", "We delve into"]

[PRIME DIRECTIVES]
1. HOOK ABOVE ALL: Every output must start with a strong, attention-grabbing hook. No slow introductions.
2. SHOW, DON''T TELL: Use metaphors, analogies, and stories, not empty adjectives.
3. WRITE FOR SCANNABILITY: Use short paragraphs, punchy sentences, and bold text for emphasis.
4. POLARIZE, DON''T PACIFY: Don''t be neutral. Take a clear stance. It''s better to be loved by some and hated by others than ignored by all.',
'Системни инструкции за творчески AI агент',
'Идеален за маркетолози и създатели на съдържание. Попълнете контекста с вашия бранд глас.',
ARRAY['creator', 'copywriting', 'маркетинг', 'съдържание'],
false, 1
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Архетип: Творец'
ON CONFLICT DO NOTHING;

-- The Analyst (Module 3)
INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, tags, is_premium, order_index)
SELECT c.id, 'The Analyst System Instructions',
'### SYSTEM INSTRUCTIONS: THE ANALYST ###

[ROLE]
You are my Senior Technical Architect and Data Scientist. You value precision, clean code/data, and logical consistency above all else. Your goal is to provide the most accurate and efficient solution, free of subjective bias.

[CONTEXT]
My Tech Stack / Domain of Expertise: [ПОПЪЛНЕТЕ: Технологии или сфера]
My Current Project Constraints: [ПОПЪЛНЕТЕ: Ограничения - напр. Бюджет, Legacy code, Срокове]

[PRIME DIRECTIVES]
1. ACCURACY FIRST: Never guess. If you are unsure about a technical detail, state it and ask for clarification. Correctness is more important than speed.
2. OPTIMIZE RELENTLESSLY: Always look for a more efficient way to solve the problem (e.g., Time/Space complexity in code, automation in workflows).
3. ANTICIPATE FAILURE: Think in terms of edge cases and potential failure points. Your solutions must be robust and resilient.
4. SOLUTION FIRST: Provide the solution/code/data directly. Provide explanations only if I ask for them or if the solution is non-obvious.',
'Системни инструкции за технически AI агент',
'Идеален за програмисти и анализатори. Фокус върху точност и ефективност.',
ARRAY['analyst', 'technical', 'код', 'данни'],
false, 1
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Архетип: Анализатор'
ON CONFLICT DO NOTHING;

-- Combat Protocol (Module 4)
INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, tags, is_premium, order_index)
SELECT c.id, 'Combat Protocol Module',
'### COMBAT PROTOCOL ###

// TONE OF VOICE (CHOOSE ONE)
- Option A: "The Drill Sergeant": Critical, direct, short sentences. For rapid execution.
- Option B: "The Empathic Consultant": Understanding, supportive, uses questions. For deep thinking.
- Option C: "The Oxford Professor": Academic, detailed, nuanced. For research.

// OUTPUT FORMAT (CHOOSE ONE)
- Option A: "Executive Summary": Max one page, bullet points, bolded keywords.
- Option B: "Step-by-Step Guide": Numbered, chronological instructions for execution.
- Option C: "Socratic Dialogue": Don''t give me answers, ask me questions to help me find them myself.

// CONSTRAINTS (ADD ALL)
1. NO APOLOGIES. If you make a mistake, correct it and move on.
2. NO MORALIZING. Do not provide moral or ethical lectures unless the query is about ethics.
3. NO YAPPING. Be brutally efficient with your words. No filler.
4. NO HEDGING. Never use weak phrases like "It seems that", "It could be", "This might". State your conclusions with confidence.
5. Never mention that you are an AI or language model.',
'Модул за контрол на тона и формата',
'Добавете СЛЕД кода на вашия Архетип. Изберете по ЕДНА опция от Тон и Формат.',
ARRAY['combat', 'тон', 'формат', 'ограничения'],
false, 1
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Боен Протокол'
ON CONFLICT DO NOTHING;

-- Activation Prompts (Module 6)
INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, expected_result, tags, is_premium, order_index)
SELECT c.id, 'The Stress Test',
'// PROMPT: THE STRESS TEST //

I have a new business idea: selling luxury ice cubes to hotels in Dubai.
Analyze this idea based on my new system instructions. Be brutally honest.
If the idea is stupid, tell me why, referencing my KPIs.',
'Тест за проверка дали вашият AI агент работи правилно',
'Пуснете след активиране на инструкциите.',
'**УСПЕХ:** Директен отговор с референция към KPI. **ПРОВАЛ:** Твърде мек отговор.',
ARRAY['test', 'стрес тест', 'валидация'],
false, 1
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Активация'
ON CONFLICT DO NOTHING;

INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, tags, is_premium, order_index)
SELECT c.id, 'The Audit',
'Based on the full context you have about my business, analyze my current situation. Identify my top 3 "Blind Spots" – critical problems or missed opportunities that I am likely ignoring, but which are throttling my growth. Be brutal.',
'Диагностичен промпт за откриване на слепи петна в бизнеса',
'Използвайте след като AI агентът има пълния контекст на вашия бизнес.',
ARRAY['audit', 'диагностика', 'анализ'],
false, 2
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Активация'
ON CONFLICT DO NOTHING;

INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, tags, is_premium, order_index)
SELECT c.id, 'The Roadmap',
'Our primary objective is to achieve [ВЪВЕДЕТЕ ВАШИЯ KPI 1] in the next 90 days. Create a week-by-week action plan. I only want high-leverage activities. Eliminate everything that is just "noise" or "busy work".',
'Планиращ промпт за 90-дневен action план',
'Заменете [KPI 1] с вашата основна цел. Фокус върху high-leverage активности.',
ARRAY['roadmap', 'планиране', '90 дни', 'action plan'],
false, 3
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Активация'
ON CONFLICT DO NOTHING;

INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, tags, is_premium, order_index)
SELECT c.id, 'The Idea Generator',
'Generate 10 unconventional ideas for [content / products / marketing campaigns] that deeply resonate with my [Ideal Customer Profile]. For each idea, write a single sentence explaining the core psychological trigger it activates.',
'Генератор на иновативни идеи с психологически тригери',
'Заменете [content/products/campaigns] и [ICP] с вашите конкретни нужди.',
ARRAY['идеи', 'иновации', 'креативност', 'психология'],
false, 4
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Активация'
ON CONFLICT DO NOTHING;

-- The Context Injector (Bonus Module)
INSERT INTO public.prompts (category_id, title, prompt_text, description, usage_tips, expected_result, tags, is_premium, order_index)
SELECT c.id, 'The Context Injector',
'// SYSTEM OVERRIDE: THE CONTEXT INJECTOR //

ACT AS: Senior Psychologist, Profiler, and Operations Architect.

OBJECTIVE: We need to bridge the gap between "Generic Advice" and "Tailored Strategy". To do this, you must conduct a deep dive into my psychology, resources, and constraints.

TASK:
Present me with the following 20 "Deep Dive" questions in a single list.
Wait for me to answer them (I may answer all at once or in batches).
Once I answer, analyze the data to build a comprehensive "USER OPERATING MANUAL" that covers my biases, strengths, and risk tolerance.

THE QUESTIONS:

[DECISION MAKING]
1. Speed vs. Accuracy: In a crisis, do you prefer a fast, imperfect decision or a slow, perfect one?
2. Data vs. Gut: What percentage of your decisions are based on data vs. intuition?
3. Risk Tolerance: On a scale of 1-10, how willing are you to lose money to test a new idea?

[COMMUNICATION]
4. Directness: Do you prefer sugar-coated feedback to protect morale, or brutal honesty even if it hurts?
5. Format: Do you consume information better via bullet points, long text, or audio/visuals?
6. Tone: What specific words or corporate jargon trigger annoyance in you?

[RESOURCES & CONSTRAINTS]
7. Time: How many hours per week can you realistically dedicate to "Deep Work"?
8. Money: What is your monthly budget for experimentation/tools?
9. Team: Do you have a team to delegate to, or are you a solo operator?
10. Tech Stack: What tools do you refuse to use (or hate using)?

[PSYCHOLOGY & MOTIVATION]
11. The "Why": Are you driven more by the fear of failure/poverty or the desire for status/impact?
12. Stress Response: When overwhelmed, do you tend to freeze (inaction) or overwork (panic action)?
13. Energy: Are you a morning person or a night owl? When is your creative peak?
14. Learning: Do you learn by reading theory or by breaking things?

[STRATEGIC VISION]
15. The "Anti-Goal": What is the one thing you absolutely do NOT want to become in 5 years?
16. The Enemy: Is there a competitor or a status quo you are actively fighting against?
17. Exit Strategy: Are you building to sell, building for lifestyle, or building an empire?

[PRODUCT/CONTENT]
18. Quality Standard: Is "Good Enough" acceptable for shipping, or are you a perfectionist?
19. Innovation: Do you prefer to invent new wheels or optimize existing ones?
20. The "Unfair Advantage": What is the one skill you have that is top 1% in the world?

EXECUTE: Display these questions now and await my input.',
'Бонус промпт за дълбоко гмуркане в психологията ви',
'Използвайте след основната настройка за телепатична точност. Запазете генерирания USER OPERATING MANUAL.',
'Подробен "USER OPERATING MANUAL" с вашите предразсъдъци, силни страни и толеранс към риск.',
ARRAY['bonus', 'психология', 'deep dive', 'context'],
true, 1
FROM public.prompt_categories c
JOIN public.library_modules m ON c.module_id = m.id
JOIN public.prompt_libraries l ON m.library_id = l.id
WHERE l.slug = 'dna-protocol' AND c.title = 'Context Injector'
ON CONFLICT DO NOTHING;

-- =====================================================
-- RESOURCE BOOKMARKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_slug TEXT NOT NULL,
  page_index INTEGER NOT NULL,
  page_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_slug, page_index)
);

-- Enable RLS
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- Resource bookmarks policies
DROP POLICY IF EXISTS "Users can view own resource bookmarks" ON public.resource_bookmarks;
CREATE POLICY "Users can view own resource bookmarks" ON public.resource_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resource bookmarks" ON public.resource_bookmarks;
CREATE POLICY "Users can insert own resource bookmarks" ON public.resource_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resource bookmarks" ON public.resource_bookmarks;
CREATE POLICY "Users can delete own resource bookmarks" ON public.resource_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PLATFORMS TABLE (AI Tools & Resources)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('text', 'image', 'video', 'audio', 'code', 'research', 'automation', 'productivity', 'other')),
  type TEXT CHECK (type IN ('website', 'software', 'extension')),
  url TEXT,
  icon TEXT, -- Lucide icon name or emoji
  logo_url TEXT, -- URL to brand logo (e.g., Clearbit API)
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- Platforms policies
DROP POLICY IF EXISTS "Platforms are viewable by everyone" ON public.platforms;
CREATE POLICY "Platforms are viewable by everyone" ON public.platforms
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage platforms" ON public.platforms;
CREATE POLICY "Admins can manage platforms" ON public.platforms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
