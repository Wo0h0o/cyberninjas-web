# CyberNinjas Technical Architecture Directive

> **Цел на документа:** Референция за AI асистенти и разработчици при работа по платформата.
> **Последна актуализация:** 2025-12-13
> **Stack:** Next.js 14 (App Router) + Supabase

---

## 🎭 Archetype: Технически Архитект / Fullstack Developer

> **Инструкция за AI:** Когато работиш по този документ или участваш в технически сесии, приеми ролята на описания архетип.

### Профил

| Характеристика | Описание |
|----------------|----------|
| **Роля** | Senior Software Architect / Lead Fullstack Developer |
| **Опит** | 8+ години в production systems, 4+ в EdTech/SaaS |
| **Stack** | Next.js, React, TypeScript, Supabase, CSS |
| **Референтни фигури** | Theo Browne, Guillermo Rauch, Kent C. Dodds |

### Принципи

- **Simplicity > Cleverness** — Пиши код, който junior developer може да разбере
- **Boring Technology** — Избирай proven solutions
- **Type Safety** — TypeScript е non-negotiable
- **Performance First** — Lighthouse score > 90

---

## 🎯 Проектна Визия

**CyberNinjas** е LMS платформа с фокус върху:
1. **Prompt Library** — Библиотека с готови prompts
2. **Courses** — Видео курсове с progress tracking
3. **Resources** — Безплатни материали и guides

---

## 🏗️ Технически Stack

| Компонент | Технология |
|-----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | CSS Variables + Vanilla CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Video** | Vimeo Pro (Private) |
| **Payments** | Stripe (future) |
| **Hosting** | Vercel |

---

## 🗺️ Sitemap

### Public Pages

```
/                     → Landing Page (minimal)
/login                → Login page
/register             → Registration page
```

### Private Pages (LMS)

```
/dashboard            → User dashboard
/prompts              → Prompt Library
/prompts/[category]   → Prompt category
/courses              → Course catalog
/courses/[slug]       → Course overview
/courses/[slug]/[lesson] → Lesson player
/resources            → Free resources
/profile              → User profile
/settings             → Account settings
```

---

## 📐 Component Architecture

### Shared Components (Landing + LMS)

| Component | Description |
|-----------|-------------|
| `GlassCard` | Glassmorphism card with hover glow |
| `GlowButton` | Gradient button with glow effect |
| `GhostButton` | Secondary transparent button |
| `Input` | Dark-styled input field |
| `ProgressBar` | Gradient progress indicator |
| `Spinner` | Loading spinner |
| `Skeleton` | Loading skeleton |

### Landing-Specific Components

| Component | Description |
|-----------|-------------|
| `Hero` | Main hero section |
| `OfferGrid` | Grid of offerings (prompts, courses, resources) |
| `MinimalFooter` | Simple footer |

### LMS-Specific Components

| Component | Description |
|-----------|-------------|
| `Sidebar` | Navigation sidebar |
| `VideoPlayer` | Course video player |
| `LessonList` | Collapsible lesson list |
| `CourseCard` | Course preview card |
| `PromptCard` | Prompt preview with copy button |

---

## ✨ Animation Specifications

### Framer Motion Config

```typescript
// animations/config.ts
export const animations = {
  // Page entrance
  pageEnter: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  
  // Stagger container
  stagger: {
    animate: { transition: { staggerChildren: 0.1 } }
  },
  
  // Card hover
  cardHover: {
    scale: 1.02,
    transition: { duration: 0.3 }
  },
  
  // Glow pulse for CTAs
  glowPulse: {
    boxShadow: [
      '0 0 20px rgba(139, 92, 246, 0.3)',
      '0 0 40px rgba(139, 92, 246, 0.5)',
      '0 0 20px rgba(139, 92, 246, 0.3)'
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};
```

### Scroll Reveal (Intersection Observer)

```typescript
// hooks/useScrollReveal.ts
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);
}
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- USERS
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMP,
  last_login TIMESTAMP
)

-- PROMPT CATEGORIES
prompt_categories (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  description TEXT,
  icon TEXT,
  order_index INTEGER
)

-- PROMPTS
prompts (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES prompt_categories,
  title TEXT,
  description TEXT,
  prompt_text TEXT,
  tags TEXT[],
  is_free BOOLEAN DEFAULT true,
  copy_count INTEGER DEFAULT 0,
  order_index INTEGER
)

-- COURSES
courses (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER
)

-- MODULES
modules (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses,
  title TEXT,
  order_index INTEGER
)

-- LESSONS
lessons (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules,
  title TEXT,
  description TEXT,
  video_url TEXT,
  duration_seconds INTEGER,
  content_html TEXT,
  is_free_preview BOOLEAN DEFAULT false,
  order_index INTEGER
)

-- USER PROGRESS
user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  lesson_id UUID REFERENCES lessons,
  is_completed BOOLEAN DEFAULT false,
  video_position_seconds INTEGER,
  completed_at TIMESTAMP,
  UNIQUE(user_id, lesson_id)
)

-- RESOURCES
resources (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  type TEXT, -- 'pdf' | 'link' | 'video'
  url TEXT,
  is_free BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  order_index INTEGER
)
```

---

## 🎬 Video Player Features

| Feature | Priority |
|---------|----------|
| Playback Speed (0.5x - 2x) | HIGH |
| Keyboard shortcuts | HIGH |
| Resume from last position | HIGH |
| Picture-in-Picture | MEDIUM |

---

## 📂 Project Structure

```
/app
  /page.tsx                 # Landing page
  /login/page.tsx           # Login
  /register/page.tsx        # Register
  /(dashboard)              # Protected routes group
    /dashboard/page.tsx
    /prompts/page.tsx
    /prompts/[category]/page.tsx
    /courses/page.tsx
    /courses/[slug]/page.tsx
    /courses/[slug]/[lesson]/page.tsx
    /resources/page.tsx
    /profile/page.tsx
    /settings/page.tsx
  /layout.tsx
  /globals.css

/components
  /ui                       # Shared UI components
    /GlassCard.tsx
    /GlowButton.tsx
    /GhostButton.tsx
    /Input.tsx
    /ProgressBar.tsx
    /Spinner.tsx
    /Skeleton.tsx
  /landing                  # Landing page components
    /Hero.tsx
    /OfferGrid.tsx
    /MinimalFooter.tsx
  /lms                      # LMS components
    /Sidebar.tsx
    /VideoPlayer.tsx
    /LessonList.tsx
    /CourseCard.tsx
    /PromptCard.tsx

/lib
  /supabase.ts              # Supabase client
  /auth.ts                  # Auth helpers
  /animations.ts            # Animation configs

/hooks
  /useScrollReveal.ts
  /useAuth.ts

/styles
  /variables.css            # CSS variables
```

---

## ⚠️ Важни Constraint-и

1. **Dark Theme Only** — Без light mode toggle
2. **Bold Animations** — Glow effects, fade-ins, scale on hover
3. **Purple Gradient** — Primary accent color
4. **No Illustrations** — Само icons и abstract elements
5. **Mobile-First** — Responsive на всички устройства
6. **Bulgarian Language** — Целият UI на български
7. **Performance** — Lighthouse score > 90

---

## 📋 Свързани Документи

- [MARKETING_STRATEGY.md](./MARKETING_STRATEGY.md) - Маркетинг стратегия
- [UX_UI_STRATEGY.md](./UX_UI_STRATEGY.md) - UX/UI Design System
