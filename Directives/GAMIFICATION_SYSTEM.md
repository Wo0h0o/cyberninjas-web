# 🎮 GAMIFICATION SYSTEM DIRECTIVE
**CyberNinjas LMS Platform**  
*Complete Implementation Guide*

---

## 📋 SYSTEM OVERVIEW

The CyberNinjas gamification system transforms learning into an engaging journey through:
- **XP (Experience Points)** - Earned through platform actions
- **Levels** (1-20) - Progressive user advancement
- **Achievements** - Unlockable milestones with XP rewards
- **Streaks** - Daily login consistency tracking
- **Ninja Companion** - Contextual AI guide with personality

---

## 🗄️ DATABASE ARCHITECTURE

### Core Tables

#### `user_levels`
Tracks user progression and activity.

```sql
CREATE TABLE user_levels (
  user_id UUID PRIMARY KEY,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  title TEXT DEFAULT 'Novice',
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Titles by Level:**
- Level 1-3: Novice
- Level 4-7: Apprentice
- Level 8-12: Adept
- Level 13-16: Expert
- Level 17-19: Master
- Level 20: Legend

#### `achievements`
Defines all unlockable achievements.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tier INTEGER DEFAULT 1,
  is_secret BOOLEAN DEFAULT false,
  xp_reward INTEGER DEFAULT 0,
  trigger_conditions JSONB,
  created_at TIMESTAMPTZ
)
```

**Tier System:**
- Tier 1: Bronze (50-100 XP)
- Tier 2: Silver (150-300 XP)
- Tier 3: Gold (500-2000 XP)

#### `user_achievements`
Tracks which achievements users have unlocked.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID,
  achievement_id UUID,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
)
```

#### `resource_bookmarks`
Tracks bookmarked resources for achievements.

```sql
CREATE TABLE resource_bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID,
  resource_id TEXT,
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, resource_id)
)
```

#### `platform_visits`
Tracks AI platform exploration.

```sql
CREATE TABLE platform_visits (
  id UUID PRIMARY KEY,
  user_id UUID,
  platform_id UUID,
  visited_at TIMESTAMPTZ,
  UNIQUE(user_id, platform_id)
)
```

---

## 🏆 ACHIEVEMENTS CATALOG

### Learning Achievements

**First Steps** (🎯 50 XP, Tier 1)
- Complete first lesson
- Auto-unlock on 1st lesson completion

**Knowledge Seeker** (📚 100 XP, Tier 1)
- Complete 5 lessons
- Encourages continued learning

**Perfectionist** (⭐ 200 XP, Tier 2)
- Complete first course to 100%
- Rewards course completion

**Marathon Runner** (🏃 500 XP, Tier 2)
- Complete 3 full courses
- Long-term engagement

### Profile Achievements

**First Impression** (🖼️ 100 XP, Tier 1)
- Upload profile avatar
- Encourages profile customization

### Resource Achievements

**Bookworm** (📚 50 XP, Tier 1)
- Bookmark 1st resource
- First-time bookmark

**Collector** (🗃️ 150 XP, Tier 2)
- Bookmark 10 resources
- Regular resource usage

**Curator** (🏛️ 500 XP, Tier 3)
- Bookmark 50 resources
- Power user milestone

### Exploration Achievements

**Platform Explorer** (🌐 100 XP, Tier 1)
- Visit first AI platform
- Encourages exploration

**Shiny Hunter** (✨ 150 XP, Tier 2)
- Visit 10 different platforms
- Broad platform exploration

### Engagement Achievements

**Dedicated** (🔥 100 XP, Tier 1)
- Maintain 3-day login streak
- Early streak milestone

**Consistent** (📅 150 XP, Tier 2)
- Maintain 7-day login streak
- Weekly consistency

**Unstoppable** (⚡ 300 XP, Tier 2)
- Maintain 30-day login streak
- Monthly dedication

**Legendary Streak** (👑 2000 XP, Tier 3)
- Maintain 100-day login streak
- Ultimate commitment

---

## ⚡ XP REWARD SYSTEM

### Automatic XP Awards

| Action | XP Award | Trigger |
|--------|----------|---------|
| Lesson Completion | +25 XP | First-time complete |
| Course 100% | +100 XP | Bonus on completion |
| Prompt Copy | +5 XP | Each copy action |
| Platform Visit | +10 XP | First visit only |
| Avatar Upload | +100 XP | Via "First Impression" achievement |
| Resource Bookmark | +50-500 XP | Via bookmark achievements |
| Achievement Unlock | +50-2000 XP | Varies by tier |

### XP Thresholds (Level 1-20)

```typescript
const XP_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  1750,  // Level 6
  2750,  // Level 7
  4000,  // Level 8
  5500,  // Level 9
  7500,  // Level 10
  10000, // Level 11
  13000, // Level 12
  16500, // Level 13
  20500, // Level 14
  25000, // Level 15
  30000, // Level 16
  36000, // Level 17
  43000, // Level 18
  51000, // Level 19
  60000  // Level 20 (MAX)
]
```

---

## 🎣 CUSTOM HOOKS

### `useUserLevel()`
**Location:** `hooks/useUserLevel.ts`

**Exports:**
- `level`: Current user level (1-20)
- `xp`: Total XP earned
- `title`: Level title (Novice, Master, etc.)
- `xpForNextLevel`: XP needed for next level
- `progressPercentage`: Progress to next level (0-100%)
- `streak`: Current login streak days
- `addXP(amount, reason)`: Award XP and trigger level-ups
- `updateStreak()`: Update daily streak
- `loading`: Data loading state

**Usage:**
```tsx
const { level, xp, title, addXP, updateStreak } = useUserLevel()

// Award XP
await addXP(25, 'Completed lesson: Introduction to AI')

// Update streak (call on dashboard mount)
await updateStreak()
```

### `useAchievements()`
**Location:** `hooks/useAchievements.ts`

**Exports:**
- `achievements`: All available achievements
- `unlockedAchievements`: User's unlocked achievements
- `checkAchievement(code, stats)`: Check if achievement should unlock
- `unlockAchievement(code)`: Manually unlock achievement
- `isUnlocked(code)`: Check if specific achievement is unlocked
- `loading`: Data loading state

**Usage:**
```tsx
const { checkAchievement, isUnlocked } = useAchievements()

// Check achievement after action
await checkAchievement('first_impression', {
  hasAvatar: true
})

// Conditional rendering
{isUnlocked('perfectionist') && <Badge>Course Master</Badge>}
```

### `useResourceBookmarks()`
**Location:** `hooks/useResourceBookmarks.ts`

**Exports:**
- `isBookmarked(resourceId)`: Check if bookmarked
- `toggleBookmark(resourceId)`: Toggle bookmark
- `bookmarkCount`: Total bookmarks
- `getBookmarkedResources()`: Get all bookmarked resources
- `refreshBookmarks()`: Refresh bookmark list
- `loading`: Data loading state

**Usage:**
```tsx
const { isBookmarked, toggleBookmark, bookmarkCount } = useResourceBookmarks()

// Toggle bookmark
await toggleBookmark(resourceId)

// Achievement checks happen automatically!
```

---

## 🎨 UI COMPONENTS

### `LevelHeader`
**Location:** `components/gamification/LevelHeader.tsx`

Displays user level, XP, and progress bar in dashboard header.

**Features:**
- Animated XP bar
- Level-up animations
- Streak display
- Click to view profile

### `AchievementToast`
**Location:** `components/gamification/AchievementToast.tsx`

Shows achievement unlock notifications.

**Features:**
- Animated slide-in from bottom
- Achievement icon and details
- XP reward display
- Auto-dismiss after 5 seconds
- Sound effect (optional)

### `NinjaCompanion`
**Location:** `components/gamification/NinjaCompanion.tsx`

Contextual AI guide with personality.

**Features:**
- Animated ninja character
- Context-aware messages
- Action buttons
- Emotion states (happy, thinking, celebrating)
- Click to dismiss

---

## 🔄 XP REWARD FLOW

### Lesson Completion Flow

```typescript
// In hooks/useUserProgress.ts - updateLessonProgress()

1. User completes lesson
2. Check if lesson was already completed
3. If newly completed:
   a. Award +25 XP via addXP()
   b. Check if course reached 100%
   c. If 100%, award +100 XP bonus
   d. Trigger achievement checks
   e. Show achievement toast if unlocked
   f. Update UI with new XP/level
```

### Avatar Upload Flow

```typescript
// In AvatarUpload.tsx - handleUpload()

1. User uploads avatar
2. Resize to 256x256
3. Upload to Supabase Storage
4. Update profile.avatar_url
5. Check if first avatar upload
6. If first, trigger "First Impression" achievement
7. Achievement auto-awards +100 XP
8. Show achievement toast
```

### Resource Bookmark Flow

```typescript
// In useResourceBookmarks.ts - toggleBookmark()

1. User clicks bookmark button
2. Insert into resource_bookmarks table
3. Update local bookmark count
4. Check achievement milestones:
   - 1 bookmark → Bookworm (+50 XP)
   - 10 bookmarks → Collector (+150 XP)
   - 50 bookmarks → Curator (+500 XP)
5. Show achievement toast if unlocked
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure ✅
- [x] Database tables (user_levels, achievements, user_achievements)
- [x] useUserLevel hook
- [x] useAchievements hook
- [x] LevelHeader component
- [x] AchievementToast component
- [x] NinjaCompanion component

### Phase 2: XP Triggers ✅
- [x] Lesson completion XP (+25)
- [x] Course 100% bonus (+100)
- [x] Prompt copy XP (+5)
- [x] Profile avatar achievement
- [x] Resource bookmark achievements

### Phase 3: Platform Integration ⚙️ (In Progress)
- [x] Platform visits database
- [x] handleVisitPlatform function
- [ ] Connect to platform card UI
- [ ] Dashboard streak auto-update

---

## 📊 ANALYTICS & TRACKING

### Key Metrics to Monitor

**User Engagement:**
- Average XP per user
- Daily active users with streaks
- Achievement unlock rate
- Level distribution

**Feature Usage:**
- Lesson completion rate
- Course completion rate
- Resource bookmark frequency
- Platform visit diversity

**Gamification Impact:**
- XP correlation with retention
- Streak impact on daily logins
- Achievement impact on course completion

---

## 🎯 FUTURE ENHANCEMENTS

### Planned Features

**Social Elements:**
- Leaderboards (weekly/all-time)
- Share achievements on social media
- User profiles with achievement showcase
- Friend system and comparisons

**Advanced Achievements:**
- Secret achievements
- Time-limited achievements
- Challenge achievements
- Community achievements

**Rewards:**
- XP multipliers for streaks
- Bonus XP days/events
- Premium content unlocks
- Profile customization items

**AI Companion Evolution:**
- More personality types
- Learning recommendations
- Progress insights
- Motivational messages

---

## 🛠️ MAINTENANCE GUIDE

### Adding New Achievements

1. **Insert into database:**
```sql
INSERT INTO achievements (code, name, description, icon, tier, xp_reward)
VALUES ('new_achievement', 'Achievement Name', 'Description', '🎯', 1, 100);
```

2. **Add check logic in relevant hook/component:**
```tsx
if (condition) {
  await checkAchievement('new_achievement', { stats })
}
```

3. **Test unlock and XP award**

### Adjusting XP Rewards

1. Update `XP_REWARDS` constant in relevant file
2. Update this directive documentation
3. Communicate changes to users
4. Monitor impact on progression

### Database Migrations

Always use Supabase migrations for changes:
```sql
-- Migration: add_new_column
ALTER TABLE user_levels ADD COLUMN new_field TYPE;
```

Test on development environment first!

---

## 📞 SUPPORT & DEBUGGING

### Common Issues

**Achievement not unlocking:**
- Check trigger condition logic
- Verify achievement exists in database
- Check `checkAchievement()` parameters
- Review console for errors

**XP not updating:**
- Check `addXP()` is awaited
- Verify user_levels row exists
- Check RLS policies
- Review network tab for failed requests

**Streak not incrementing:**
- Verify `updateStreak()` is called on dashboard mount
- Check `last_activity_date` in database
- Ensure user is authenticated

---

## 📝 CODE STYLE GUIDE

### Achievement Codes
- Use snake_case: `first_impression`
- Be descriptive: `complete_first_lesson` not `lesson_1`
- Consistent prefixes for categories: `streak_*`, `course_*`

### XP Reward Amounts
- Small actions: 5-25 XP
- Medium milestones: 50-150 XP
- Major achievements: 200-500 XP
- Epic accomplishments: 1000-2000 XP

### Hook Usage
- Always await async functions
- Handle loading states
- Show user feedback for XP awards
- Graceful error handling

---

**Last Updated:** 2025-12-19  
**Version:** 2.0  
**Status:** Production Ready ✅
