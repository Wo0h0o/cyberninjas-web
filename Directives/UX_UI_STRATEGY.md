# CyberNinjas UX/UI Strategy Directive

> **Цел на документа:** Референция за дизайн system, компоненти и UX patterns.
> **Последна актуализация:** 2025-12-13
> **Дизайн тема:** Premium Dark + Glassmorphism

---

## 🎭 Archetype: UI/UX Дизайнер

> **Инструкция за AI:** Когато работиш по този документ или участваш в дизайн сесии, приеми ролята на описания архетип.

### Профил

| Характеристика | Описание |
|----------------|----------|
| **Роля** | Senior Product Designer / UX Lead |
| **Опит** | 7+ години в product design, 3+ в EdTech/LMS platforms |
| **Инструменти** | Figma, CSS, Design Systems, Prototyping |
| **Референтни фигури** | Nubien (Framer), Linear, Vercel |

### Мислене и подход

**Фокус:** Всяко решение се оценява през призмата на **user experience и visual hierarchy**. Питай се: "Потребителят ще разбере ли какво да направи? Ще се чувства ли добре правейки го?"

**Принципи:**
- **Form Follows Function** — Красотата идва от яснотата
- **Progressive Disclosure** — Показвай само релевантното
- **Consistency > Creativity** — Design system е закон
- **Accessibility is Not Optional** — Дизайн за всички, не само за идеалния потребител
- **Micro-interactions Matter** — Детайлите правят разликата между "ок" и "wow"
- **Dark Mode First** — Оптимизирано за дълги learning sessions

### Комуникационен стил

- **Визуален** — Показва, не само разказва
- **Емпатичен** — Мисли като потребителя
- **Детайл-ориентиран** — Забелязва 1px misalignment
- **Итеративен** — Приема feedback и подобрява

### Design Review Checklist

```
□ Visual Hierarchy — Ясно ли е какво е най-важно?
□ Spacing — Следва ли 4px/8px grid системата?
□ Typography — Използва ли дефинираните font sizes?
□ Colors — Само от dark palette + правилен contrast?
□ States — Default, Hover, Active, Focus, Disabled, Loading?
□ Responsive — Работи ли на 375px (mobile) до 1440px (desktop)?
□ Empty State — Какво показваме без данни?
□ A11y — Focus states? Screen reader friendly?
□ Glassmorphism — Правилен blur и opacity?
□ Glow Effects — Subtle или intense според context?
```

### Вдъхновение и референции

| Платформа | Какво взимаме |
|-----------|---------------|
| **Nubien** | Dark glassmorphism, glow effects, bold animations |
| **Linear** | Clean UI, keyboard shortcuts |
| **Vercel** | Minimalism, typography, spacing |
| **Stripe** | Documentation, attention to detail |

---

## 🎯 Design Philosophy

**CyberNinjas Design = Premium Dark + Clean + Engaging**

| Принцип | Описание |
|---------|----------|
| **Premium Dark** | Тъмна тема с glassmorphism и purple gradient accents |
| **Mobile-First** | Всичко работи перфектно на телефон |
| **Progressive Disclosure** | Показваме само релевантната информация |
| **Bold Animations** | Entrance animations, glow effects, scroll reveals |
| **No Clutter** | Straight to the point, без излишни елементи |

---

## 🎨 Design System

### Typography

**Primary Font: Inter**
- Отлична Cyrillic поддръжка
- Google Fonts (безплатен)
- Modern, clean, professional

```css
/* TYPOGRAPHY SCALE */
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px - Labels, hints */
  --text-sm: 0.875rem;    /* 14px - Secondary text */
  --text-base: 1rem;      /* 16px - Body text */
  --text-lg: 1.125rem;    /* 18px - Large body */
  --text-xl: 1.25rem;     /* 20px - Section titles */
  --text-2xl: 1.5rem;     /* 24px - Page subtitles */
  --text-3xl: 1.875rem;   /* 30px - Page titles */
  --text-4xl: 2.25rem;    /* 36px - Hero headings */
  --text-5xl: 3rem;       /* 48px - Landing hero */
  --text-6xl: 3.75rem;    /* 60px - Large headlines */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### Color Palette - Dark Theme

```css
/* DARK THEME - CyberNinjas 2.0 */
:root {
  /* BACKGROUNDS */
  --background: #09090B;              /* Main page background */
  --background-secondary: #0F0F12;    /* Slightly lighter sections */
  --surface: rgba(255, 255, 255, 0.03);  /* Cards, modals */
  --surface-hover: rgba(255, 255, 255, 0.06);
  --surface-active: rgba(255, 255, 255, 0.09);
  
  /* GLASSMORPHISM */
  --glass-bg: rgba(255, 255, 255, 0.02);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-blur: 20px;
  
  /* PRIMARY GRADIENT - Purple */
  --gradient-primary: linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%);
  --gradient-accent: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  --gradient-text: linear-gradient(135deg, #A855F7 0%, #C084FC 50%, #E879F9 100%);
  
  /* SOLID ACCENT COLORS */
  --accent-purple: #8B5CF6;
  --accent-purple-light: #A855F7;
  --accent-purple-dark: #7C3AED;
  
  /* GLOW EFFECTS */
  --glow-sm: 0 0 20px rgba(139, 92, 246, 0.3);
  --glow-md: 0 0 40px rgba(139, 92, 246, 0.4);
  --glow-lg: 0 0 60px rgba(139, 92, 246, 0.5);
  --glow-intense: 0 0 80px rgba(139, 92, 246, 0.6);
  
  /* SEMANTIC */
  --success: #10B981;
  --success-glow: 0 0 20px rgba(16, 185, 129, 0.3);
  --warning: #F59E0B;
  --error: #EF4444;
  --error-glow: 0 0 20px rgba(239, 68, 68, 0.3);
  
  /* TEXT */
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  
  /* BORDERS */
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.15);
  --border-focus: var(--accent-purple);
  
  /* SHADOWS */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
}
```

### Spacing System

```css
/* 4px BASE GRID */
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px - Small elements */
  --radius-md: 0.5rem;    /* 8px - Buttons, inputs */
  --radius-lg: 0.75rem;   /* 12px - Cards */
  --radius-xl: 1rem;      /* 16px - Modals */
  --radius-2xl: 1.5rem;   /* 24px - Large cards */
  --radius-full: 9999px;  /* Pills, avatars */
}
```

---

## 📱 Responsive Breakpoints

```css
/* BREAKPOINT SYSTEM */
--breakpoint-sm: 640px;   /* Small phones landscape */
--breakpoint-md: 768px;   /* Tablets portrait */
--breakpoint-lg: 1024px;  /* Tablets landscape, small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Layout Behavior per Breakpoint

| Breakpoint | Layout | Navigation |
|------------|--------|------------|
| **< 768px** (Mobile) | 1 column, stacked | Hamburger menu |
| **768-1024px** (Tablet) | 2 columns, sidebar collapsible | Sidebar + top nav |
| **> 1024px** (Desktop) | Full layout | Full sidebar |

---

## 🧩 Component Specifications

### Glassmorphism Card

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: all 300ms ease;
  
  &:hover {
    border-color: var(--border-hover);
    box-shadow: var(--glow-sm);
    transform: translateY(-2px);
  }
}
```

### Gradient Button (Primary CTA)

```css
.btn-gradient {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-3) var(--space-8);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  border: none;
  cursor: pointer;
  transition: all 300ms ease;
  box-shadow: var(--glow-sm);
  
  &:hover {
    box-shadow: var(--glow-md);
    transform: translateY(-2px) scale(1.02);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
  
  &:focus-visible {
    outline: 2px solid var(--accent-purple);
    outline-offset: 2px;
  }
}
```

### Ghost Button (Secondary)

```css
.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  padding: var(--space-3) var(--space-6);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 200ms ease;
  
  &:hover {
    background: var(--surface-hover);
    border-color: var(--border-hover);
  }
}
```

### Gradient Text

```css
.gradient-text {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Inputs

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: all 200ms ease;
  
  &:hover {
    border-color: var(--border-hover);
  }
  
  &:focus {
    border-color: var(--accent-purple);
    box-shadow: var(--glow-sm);
    outline: none;
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
}
```

### Progress Bar

```css
.progress-bar {
  height: 8px;
  background: var(--surface-active);
  border-radius: var(--radius-full);
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: var(--radius-full);
    transition: width 300ms ease;
    box-shadow: var(--glow-sm);
  }
}
```

---

## ✨ Animation System

### Entrance Animations

```css
/* Fade in from bottom */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade in with scale */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Reveal with glow */
@keyframes revealGlow {
  from {
    opacity: 0;
    box-shadow: 0 0 0 rgba(139, 92, 246, 0);
  }
  to {
    opacity: 1;
    box-shadow: var(--glow-md);
  }
}
```

### Scroll Reveal Classes

```css
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.reveal-on-scroll.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.stagger-children > * {
  opacity: 0;
  transform: translateY(20px);
}

.stagger-children.revealed > *:nth-child(1) { transition-delay: 0ms; }
.stagger-children.revealed > *:nth-child(2) { transition-delay: 100ms; }
.stagger-children.revealed > *:nth-child(3) { transition-delay: 200ms; }
.stagger-children.revealed > *:nth-child(4) { transition-delay: 300ms; }

.stagger-children.revealed > * {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.5s ease;
}
```

### Glow Pulse Animation

```css
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
  }
}

.glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}
```

### Hover Glow Effect

```css
.hover-glow {
  transition: all 300ms ease;
  
  &:hover {
    box-shadow: var(--glow-md);
    border-color: rgba(139, 92, 246, 0.3);
  }
}
```

---

## 🎭 Empty States

Когато няма съдържание, показваме текстови empty states (БЕЗ илюстрации).

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-16) var(--space-6);
  min-height: 300px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  max-width: 300px;
}
```

---

## 🎹 Keyboard Navigation

### Global Shortcuts

| Key | Action |
|-----|--------|
| `?` | Show keyboard shortcuts modal |
| `/` | Focus search |
| `Esc` | Close modal / Exit focus |

### Video Player Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` / `→` | Seek -10s / +10s |
| `↑` / `↓` | Volume up/down |
| `M` | Mute toggle |
| `F` | Fullscreen toggle |

### Course Navigation

| Key | Action |
|-----|--------|
| `J` | Previous lesson |
| `K` | Mark complete + Next |
| `L` | Next lesson |

---

## ♿ Accessibility (A11y)

### Color Contrast Requirements

| Element | Contrast Ratio | Status |
|---------|---------------|--------|
| Body text on background | ≥ 4.5:1 | ✅ `#FAFAFA` on `#09090B` = 17:1 |
| Secondary text | ≥ 4.5:1 | ✅ `#A1A1AA` on `#09090B` = 7:1 |
| Muted text | ≥ 3:1 | ✅ `#71717A` on `#09090B` = 4.5:1 |

### Focus Indicators

```css
/* All interactive elements */
:focus-visible {
  outline: 2px solid var(--accent-purple);
  outline-offset: 2px;
}

/* Reset for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ⏳ Loading States

### Skeleton Loaders

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 25%,
    var(--surface-hover) 50%,
    var(--surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Spinners

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--accent-purple);
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 📋 Launch Priorities (UX/UI)

### MUST HAVE

- [ ] Dark theme CSS variables implemented
- [ ] Core components (GlassCard, GlowButton, Input, Progress)
- [ ] Course Player responsive layout
- [ ] Loading skeletons
- [ ] Bold entrance animations
- [ ] Hover glow effects
- [ ] Accessibility: color contrast, focus states

### NICE TO HAVE

- [ ] Mark Complete animation
- [ ] Keyboard shortcuts
- [ ] Scroll-triggered reveal animations

---

## 📁 Свързани Документи

- [MARKETING_STRATEGY.md](./MARKETING_STRATEGY.md) - Маркетинг стратегия
- [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - Техническа архитектура
