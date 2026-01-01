# 🚀 Landing Page Implementation Plan - Low-Level Overview

**Project:** CyberNinjas Landing Page Redesign  
**Date:** 2025-12-27  
**Objective:** Create clean, professional Bento Grid landing page based on wireframes

---

## 📋 Table of Contents
1. [Overall Structure](#overall-structure)
2. [Component Breakdown](#component-breakdown)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Design Specifications](#design-specifications)
5. [Technical Details](#technical-details)

---

## 🏗️ Overall Structure

```
app/page.tsx (Landing Page)
├── Header (Fixed)
├── Hero Section
├── Bento Grid 1 (Features)
├── Bento Grid 2 (Discover)
├── CTA Section
└── Footer
```

### File Structure
```
components/
├── landing/
│   ├── NewHeader.tsx         ✅ NEW
│   ├── NewHero.tsx            ✅ NEW
│   ├── BentoGrid1.tsx         ✅ NEW
│   ├── BentoGrid2.tsx         ✅ NEW
│   ├── BentoCard.tsx          ✅ NEW (Utility)
│   ├── GIFContainer.tsx       ✅ NEW (Utility)
│   ├── CTASection.tsx         ♻️ UPDATE
│   └── Footer.tsx             ♻️ UPDATE
app/
└── page.tsx                   ♻️ REBUILD
```

---

## 🧩 Component Breakdown

### 1. Header Component (`NewHeader.tsx`)

**Purpose:** Fixed navigation bar with logo and links

**Layout:**
```
┌────────────────────────────────────────────┐
│ [Logo] CyberNinjas  За Нас│Материали│FAQ  [Влез] │
└────────────────────────────────────────────┘
```

**Implementation Details:**

```tsx
// Pseudo-structure
<header className="fixed top-0 left-0 right-0 z-50">
  <div className="max-w-7xl mx-auto px-6">
    <nav className="flex items-center justify-between h-20">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <img src="/landingpage-logo.png" className="h-12" />
        <span>Cyber<span className="gradient-text">Ninjas</span></span>
      </div>
      
      {/* Center: Nav Links */}
      <div className="hidden md:flex gap-8">
        <a href="#about">За Нас</a>
        <a href="#materials">Материали</a>
        <a href="#faq">FAQ</a>
      </div>
      
      {/* Right: Login */}
      <a href="/login" className="ghost-button">Влез</a>
      
      {/* Mobile: Hamburger */}
      <button className="md:hidden">☰</button>
    </nav>
  </div>
</header>
```

**CSS Specifications:**
```css
/* Header */
.header {
  background: rgba(9, 9, 11, 0.8);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 80px;
}

/* Nav Links */
.nav-link {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s;
}

.nav-link:hover {
  color: #a855f7;
}

/* Ghost Button */
.ghost-button {
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-weight: 600;
  transition: all 0.3s;
}

.ghost-button:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(168, 85, 247, 0.5);
}
```

**Mobile Responsive:**
```css
@media (max-width: 768px) {
  .nav-links {
    display: none; /* Hidden, show in mobile menu */
  }
  
  .mobile-menu {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background: rgba(9, 9, 11, 0.98);
    backdrop-filter: blur(24px);
    padding: 24px;
  }
}
```

---

### 2. Hero Section (`NewHero.tsx`)

**Purpose:** Main value proposition with CTA

**Layout:**
```
       Овладей изкуственият интелект
   Най-голямата образователна платформа
            за AI в България
           
          [Започни сега]
```

**Implementation Details:**

```tsx
<section className="relative min-h-[90vh] flex items-center justify-center">
  {/* Subtle background */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="aurora-blob-single" />
  </div>
  
  <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
    {/* Main Heading */}
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-6xl md:text-7xl font-bold mb-6"
    >
      <span className="gradient-text">
        Овладей изкуственият интелект
      </span>
    </motion.h1>
    
    {/* Subtitle */}
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-xl text-gray-400 mb-12"
    >
      Най-голямата образователна платформа за AI в България
    </motion.p>
    
    {/* CTA */}
    <motion.a
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      href="/dashboard"
      className="cta-button"
    >
      Започни сега
      <ArrowRight className="ml-2" />
    </motion.a>
  </div>
</section>
```

**CSS Specifications:**
```css
/* Gradient Text */
.gradient-text {
  background: linear-gradient(
    135deg,
    #a855f7 0%,
    #d946ef 50%,
    #ec4899 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* CTA Button */
.cta-button {
  display: inline-flex;
  align-items: center;
  padding: 20px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 9999px;
  background: linear-gradient(135deg, #8b5cf6, #d946ef);
  color: white;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
  transition: all 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(139, 92, 246, 0.6);
}

/* Single Aurora Blob */
.aurora-blob-single {
  position: absolute;
  top: -300px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.15) 0%,
    transparent 70%
  );
  filter: blur(120px);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}
```

---

### 3. Bento Grid 1 - Features (`BentoGrid1.tsx`)

**Purpose:** Showcase main platform features with Bento layout

**Exact Layout from Wireframe:**

```
┌──────────────┬─────────────────────┐
│              │   Библиотека        │
│     GIF      │   Описание          │
│   (Large)    │   1│2│3│4           │
│              │   [CTA]             │
│              ├─────────────────────┤
│              │   Ресурси           │
│              │   4x Примери        │
├──────────────┼──────────┬──────────┤
│ Експерт      │  Форум   │ Общност  │
│ (GIF+CTA)    │  (Опис)  │ (Опис)   │
└──────────────┴──────────┴──────────┘
```

**CSS Grid Structure:**

```css
.bento-grid-1 {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: repeat(2, minmax(300px, auto));
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Card Positions */
.card-gif-large {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
}

.card-library {
  grid-column: 2 / 4;
  grid-row: 1 / 2;
}

.card-resources {
  grid-column: 2 / 4;
  grid-row: 2 / 3;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.card-expert {
  grid-column: 1 / 2;
  grid-row: 3 / 4;
}

.card-forum {
  grid-column: 2 / 3;
  grid-row: 3 / 4;
}

.card-community {
  grid-column: 3 / 4;
  grid-row: 3 / 4;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .bento-grid-1 {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .card-gif-large,
  .card-library,
  .card-resources,
  .card-expert,
  .card-forum,
  .card-community {
    grid-column: 1 / -1;
    grid-row: auto;
  }
}
```

**Implementation:**

```tsx
<section className="py-24 px-6">
  <div className="bento-grid-1">
    {/* Card 1: GIF Large */}
    <BentoCard className="card-gif-large">
      <GIFContainer 
        src="/gifs/main-showcase.gif"
        alt="Platform Showcase"
      />
    </BentoCard>
    
    {/* Card 2: Библиотека */}
    <BentoCard className="card-library">
      <div className="p-8">
        <h3 className="text-3xl font-bold mb-4">Библиотека</h3>
        <p className="text-gray-400 mb-6">Описание</p>
        
        {/* Number badges */}
        <div className="flex gap-3 mb-6">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="badge">{num}</div>
          ))}
        </div>
        
        <button className="cta-small">CTA</button>
      </div>
    </BentoCard>
    
    {/* Card 3: Ресурси (4x grid) */}
    <div className="card-resources">
      <GIFContainer src="/gifs/resource-1.gif" className="resource-gif" />
      {/* ... more resources ... */}
    </div>
    
    {/* Card 4: Експерт */}
    <BentoCard className="card-expert">
      <GIFContainer src="/gifs/expert.gif" />
      <div className="p-6">
        <h4>Стани Експерт във визуалните модели</h4>
        <p>Описание</p>
        <button className="cta-small">CTA</button>
      </div>
    </BentoCard>
    
    {/* Card 5: Форум */}
    <BentoCard className="card-forum">
      <div className="p-6">
        <h4>Форум</h4>
        <p>Описание</p>
      </div>
    </BentoCard>
    
    {/* Card 6: Общност */}
    <BentoCard className="card-community">
      <div className="p-6">
        <h4>Общност</h4>
        <p>Описание</p>
      </div>
    </BentoCard>
  </div>
</section>
```

---

### 4. GIF Container with Flow Effect (`GIFContainer.tsx`)

**Purpose:** Reusable component for GIF with gradient fade to text

**The Flow Effect Explained:**

```
┌──────────────┐
│              │
│     GIF      │ ← Full opacity at top
│   Content    │
│              │ ← Starts fading at 60%
└──────────────┘
       ↓
┌──────────────┐ ← Text overlays bottom 
│   Heading    │   with negative margin
│   Description│   Creates seamless flow
└──────────────┘
```

**Implementation:**

```tsx
interface GIFContainerProps {
  src: string;
  alt: string;
  aspectRatio?: string; // "video" | "square" | "portrait"
  fadeHeight?: number; // pixels to fade at bottom
  className?: string;
}

export default function GIFContainer({
  src,
  alt,
  aspectRatio = "video",
  fadeHeight = 80,
  className
}: GIFContainerProps) {
  return (
    <div className={`gif-wrapper ${className}`}>
      <div 
        className="gif-container"
        style={{
          aspectRatio: aspectRatio === "video" ? "16/9" : 
                      aspectRatio === "square" ? "1/1" : "9/16"
        }}
      >
        <img 
          src={src} 
          alt={alt}
          className="gif-image"
          style={{
            maskImage: `linear-gradient(
              to bottom, 
              black ${100 - (fadeHeight / 400 * 100)}%, 
              transparent 100%
            )`,
            WebkitMaskImage: `linear-gradient(
              to bottom, 
              black ${100 - (fadeHeight / 400 * 100)}%, 
              transparent 100%
            )`
          }}
        />
      </div>
    </div>
  );
}
```

**CSS:**

```css
.gif-wrapper {
  position: relative;
  overflow: visible; /* Allow content to overflow */
}

.gif-container {
  width: 100%;
  border-radius: 16px 16px 0 0; /* Rounded only at top */
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1),
    rgba(217, 70, 239, 0.1)
  );
}

.gif-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Content that flows after GIF */
.gif-content-flow {
  margin-top: -80px; /* Negative margin = overlap */
  position: relative;
  z-index: 10;
  padding: 24px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(9, 9, 11, 0.95) 30%
  );
}
```

**Usage Example:**

```tsx
<BentoCard>
  <GIFContainer 
    src="/gifs/example.gif" 
    alt="Feature demo"
    fadeHeight={100}
  />
  <div className="gif-content-flow">
    <h3>Heading flows into GIF</h3>
    <p>Description text here</p>
  </div>
</BentoCard>
```

---

### 5. Bento Grid 2 - Discover (`BentoGrid2.tsx`)

**Exact Layout from Wireframe:**

```
┌──────────────┬─────────────────────┐
│              │  Viral Видеа        │
│     GIF      │  • Точка 1          │
│              │  • Точка 2          │
│              │  • Точка 3          │
├──────────────┼──────────┬──────────┤
│  IMAGE GIF   │ Ефекти   │ VIDEO GIF│
│              │ (текст)  │          │
├──────────────┴──────────┴──────────┤
│     Platform goal (широка)         │
│     [Platform image]               │
└────────────────────────────────────┘
```

**CSS Grid:**

```css
.bento-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: repeat(3, minmax(250px, auto));
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-gif-top {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.card-viral {
  grid-column: 2 / 4;
  grid-row: 1 / 2;
}

.card-image-gif {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.card-effects {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

.card-video-gif {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
}

.card-platform-goal {
  grid-column: 1 / 4;
  grid-row: 3 / 4;
  min-height: 400px;
}
```

---

### 6. Bento Card Component (`BentoCard.tsx`)

**Purpose:** Reusable card with glassmorphism

```tsx
interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function BentoCard({ 
  children, 
  className = '',
  hover = true 
}: BentoCardProps) {
  return (
    <motion.div
      className={`bento-card ${hover ? 'bento-card-hover' : ''} ${className}`}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

**CSS:**

```css
.bento-card {
  position: relative;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.bento-card-hover:hover {
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(139, 92, 246, 0.2);
}

/* Gradient overlay on hover */
.bento-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(168, 85, 247, 0.1),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.bento-card:hover::before {
  opacity: 1;
}
```

---

## 📝 Step-by-Step Implementation Plan

### **PHASE 1: Foundation** (30 min)

#### Step 1.1: Create Header Component
- [ ] Create `components/landing/NewHeader.tsx`
- [ ] Implement fixed positioning
- [ ] Add logo + brand name
- [ ] Add navigation links (За Нас, Материали, FAQ)
- [ ] Add "Влез" button
- [ ] Implement mobile hamburger menu
- [ ] Test scroll behavior (blur backdrop)

**Acceptance Criteria:**
- ✅ Header stays fixed on scroll
- ✅ Links are clickable and styled
- ✅ Mobile menu works on < 768px
- ✅ Backdrop blur visible

---

#### Step 1.2: Create Hero Section
- [ ] Create `components/landing/NewHero.tsx`
- [ ] Add main heading with gradient
- [ ] Add subtitle text
- [ ] Add "Започни сега" CTA button
- [ ] Implement fade-in animations
- [ ] Add subtle aurora background

**Acceptance Criteria:**
- ✅ Text is centered
- ✅ Gradient renders correctly
- ✅ CTA button has hover effect
- ✅ Animations trigger on mount

---

### **PHASE 2: Utility Components** (20 min)

#### Step 2.1: Create GIF Container
- [ ] Create `components/landing/GIFContainer.tsx`
- [ ] Implement gradient mask fade
- [ ] Add aspect ratio support
- [ ] Add configurable fade height
- [ ] Test with placeholder GIF

**Acceptance Criteria:**
- ✅ GIF fades at bottom
- ✅ Aspect ratios work (16:9, 1:1, 9:16)
- ✅ Fade is smooth

---

#### Step 2.2: Create Bento Card
- [ ] Create `components/landing/BentoCard.tsx`
- [ ] Implement glassmorphism styling
- [ ] Add hover elevation
- [ ] Add gradient overlay on hover
- [ ] Test with sample content

**Acceptance Criteria:**
- ✅ Card has glass effect
- ✅ Hover animation smooth
- ✅ Border changes on hover

---

### **PHASE 3: Bento Grid 1** (45 min)

#### Step 3.1: Setup Grid Layout
- [ ] Create `components/landing/BentoGrid1.tsx`
- [ ] Implement CSS Grid structure
- [ ] Define all card positions
- [ ] Test responsive breakpoints

---

#### Step 3.2: Build Cards One by One

**Card 1: GIF Large**
- [ ] Add GIFContainer with placeholder
- [ ] Set grid position (1/2, 1/3)
- [ ] Test aspect ratio

**Card 2: Библиотека**
- [ ] Add heading "Библиотека"
- [ ] Add description text
- [ ] Add 4 number badges (1,2,3,4)
- [ ] Add CTA button
- [ ] Position in grid (2/4, 1/2)

**Card 3: Ресурси (4x mini cards)**
- [ ] Create 4-column sub-grid
- [ ] Add 4 GIF placeholders
- [ ] Add "Пример" labels
- [ ] Position in grid (2/4, 2/3)

**Card 4: Експерт**
- [ ] Add GIF with flow
- [ ] Add heading
- [ ] Add description
- [ ] Add CTA button
- [ ] Test GIF fade effect

**Card 5: Форум**
- [ ] Add heading "Форум"
- [ ] Add description

**Card 6: Общност**
- [ ] Add heading "Общност"
- [ ] Add description

---

### **PHASE 4: Bento Grid 2** (45 min)

#### Step 4.1: Setup Grid Layout
- [ ] Create `components/landing/BentoGrid2.tsx`
- [ ] Implement CSS Grid structure
- [ ] Define card positions

---

#### Step 4.2: Build Cards

**Card 1: GIF Top**
- [ ] Add GIF
- [ ] Position (1/2, 1/2)

**Card 2: Viral Видеа**
- [ ] Add heading
- [ ] Add 3 bullet points
- [ ] Position (2/4, 1/2)

**Card 3: Image GIF**
- [ ] Add GIF
- [ ] Add "IMAGE GIF" label
- [ ] Position (1/2, 2/3)

**Card 4: Ефекти**
- [ ] Add heading
- [ ] Add description text
- [ ] Position (2/3, 2/3)

**Card 5: Video GIF**
- [ ] Add GIF
- [ ] Add "VIDEOS GIF" label
- [ ] Position (3/4, 2/3)

**Card 6: Platform Goal (Wide)**
- [ ] Add heading
- [ ] Add description
- [ ] Add platform image placeholder
- [ ] Position (1/4, 3/4)
- [ ] Test wide layout

---

### **PHASE 5: CTA & Footer** (20 min)

#### Step 5.1: Update CTA Section
- [ ] Update heading text
- [ ] Change button to "Започни сега"
- [ ] Adjust styling

---

#### Step 5.2: Update Footer
- [ ] Verify layout
- [ ] Test links
- [ ] Check responsive

---

### **PHASE 6: Integration** (30 min)

#### Step 6.1: Rebuild app/page.tsx
- [ ] Remove old landing code
- [ ] Import all new components
- [ ] Stack components vertically
- [ ] Add proper spacing

```tsx
// app/page.tsx structure
export default function Home() {
  return (
    <main className="bg-[#09090b]">
      <NewHeader />
      <NewHero />
      <BentoGrid1 />
      <BentoGrid2 />
      <CTASection />
      <Footer />
    </main>
  );
}
```

---

#### Step 6.2: Spacing & Polish
- [ ] Add section padding (py-24)
- [ ] Add max-widths
- [ ] Test scroll behavior
- [ ] Verify all animations

---

### **PHASE 7: Responsive & Polish** (30 min)

#### Step 7.1: Mobile Testing
- [ ] Test at 375px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (laptop)
- [ ] Test at 1440px (desktop)

---

#### Step 7.2: Performance
- [ ] Optimize GIF sizes
- [ ] Lazy load GIFs
- [ ] Check animation performance
- [ ] Test scroll smoothness

---

#### Step 7.3: Accessibility
- [ ] Add alt texts
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Test screen reader

---

## 🎨 Design Specifications

### Typography
```css
/* Headings */
h1: 64px (4rem) - Desktop, 42px (2.625rem) - Mobile
h2: 48px (3rem) - Desktop, 32px (2rem) - Mobile
h3: 32px (2rem) - Desktop, 24px (1.5rem) - Mobile
h4: 24px (1.5rem) - Desktop, 20px (1.25rem) - Mobile

/* Body */
p: 18px (1.125rem) - Desktop, 16px (1rem) - Mobile
small: 14px (0.875rem)

/* Font Weights */
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

### Color Palette
```css
/* Backgrounds */
--bg-primary: #09090b
--bg-card: rgba(255, 255, 255, 0.05)
--bg-card-hover: rgba(255, 255, 255, 0.08)

/* Borders */
--border-default: rgba(255, 255, 255, 0.1)
--border-hover: rgba(168, 85, 247, 0.3)

/* Text */
--text-primary: #fafafa
--text-secondary: #a1a1aa
--text-accent: #e5e7eb

/* Accents */
--purple-400: #c084fc
--purple-500: #a855f7
--purple-600: #9333ea
--fuchsia-500: #d946ef
--pink-500: #ec4899

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8b5cf6, #d946ef)
--gradient-text: linear-gradient(135deg, #a855f7, #d946ef, #ec4899)
```

### Spacing System
```css
/* Padding/Margin Scale */
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
4xl: 96px

/* Section Spacing */
section-padding-mobile: 80px (5rem)
section-padding-desktop: 120px (7.5rem)

/* Card Padding */
card-padding-sm: 16px
card-padding-md: 24px
card-padding-lg: 32px
```

### Border Radius
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
--radius-full: 9999px
```

### Shadows
```css
/* Card Shadows */
--shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3)
--shadow-card-hover: 0 12px 48px rgba(0, 0, 0, 0.4)

/* Glow Shadows */
--shadow-purple-glow: 0 0 40px rgba(139, 92, 246, 0.3)
--shadow-purple-glow-intense: 0 0 60px rgba(139, 92, 246, 0.5)
```

### Animations
```css
/* Durations */
--duration-fast: 0.15s
--duration-normal: 0.3s
--duration-slow: 0.5s

/* Easings */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* Transitions */
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 🔧 Technical Details

### Framer Motion Variants

```tsx
// Fade In Up
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
};

// Stagger Children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Scale on Hover
const scaleHover = {
  whileHover: { scale: 1.05 },
  transition: { duration: 0.3 }
};
```

### Responsive Breakpoints

```css
/* Tailwind Breakpoints */
sm: 640px   /* Small tablet */
md: 768px   /* Tablet */
lg: 1024px  /* Laptop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large Desktop */

/* Custom Grid Breakpoints */
@media (max-width: 1200px) {
  /* Adjust bento grid columns */
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 768px) {
  /* Stack to single column */
  grid-template-columns: 1fr;
}
```

### Performance Optimizations

```tsx
// Lazy load GIFs
<GIFContainer
  src="/gifs/example.gif"
  loading="lazy"
  decoding="async"
/>

// Intersection Observer for animations
const [ref, inView] = useInView({
  triggerOnce: true,
  threshold: 0.1
});

// Reduce motion for accessibility
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ✅ Acceptance Checklist

### Functionality
- [ ] All links work
- [ ] CTAs navigate correctly
- [ ] Mobile menu opens/closes
- [ ] Smooth scroll behavior
- [ ] GIF placeholders load

### Design
- [ ] Colors match spec
- [ ] Typography is correct
- [ ] Spacing is consistent
- [ ] Borders/shadows correct
- [ ] Gradients render properly

### Responsive
- [ ] Works on mobile (375px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Bento grids stack properly
- [ ] No horizontal scroll

### Performance
- [ ] Page loads < 3s
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts
- [ ] GIFs are optimized

### Accessibility
- [ ] All alt texts present
- [ ] Keyboard navigable
- [ ] Focus states visible
- [ ] Screen reader friendly
- [ ] Reduced motion supported

---

## 🚀 Execution Timeline

**Total Estimated Time: 4-5 hours**

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Foundation | 30 min | 🔴 Critical |
| Phase 2: Utilities | 20 min | 🔴 Critical |
| Phase 3: Bento Grid 1 | 45 min | 🟡 High |
| Phase 4: Bento Grid 2 | 45 min | 🟡 High |
| Phase 5: CTA & Footer | 20 min | 🟢 Medium |
| Phase 6: Integration | 30 min | 🔴 Critical |
| Phase 7: Polish | 30 min | 🟡 High |

---

## 📌 Notes

- Start with Header + Hero (fastest wins)
- Build Bento utilities before grids
- Test each card individually
- Use placeholder GIFs initially
- Iterate on spacing/polish at end
- Get user feedback after each phase

---

**Ready to start implementation?** ✅
