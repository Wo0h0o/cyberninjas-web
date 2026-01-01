# 📚 Markdown to Database Migration Guide

> **Цел:** Как да импортираме .md файлове (prompt libraries) директно в Supabase базата данни, така че да са редактируеми от админския панел.

## 🎯 Резюме

Този документ описва процеса на миграция на Markdown файлове с prompt библиотеки към PostgreSQL базата данни в Supabase. След миграцията, цялото съдържание може да се редактира чрез админския панел без нужда от промени в кода.

---

## 📋 Структура на Базата Данни

### Таблици и Връзки

```
prompt_libraries (библиотека)
    ↓
library_modules (модули)
    ↓
    ├─ module_sections (intro/narrative секции)
    └─ prompt_categories (категории)
           ↓
       prompts (индивидуални промпти)
```

### Ключови Полета

- **prompt_libraries**: `slug` (уникален, за URL), `title`, `description`, `is_premium`
- **library_modules**: `title`, `subtitle`, `icon`, `order_index`
- **module_sections**: `content` (Markdown), `section_type` ('narrative' за intro)
- **prompts**: `title`, `prompt_text`, `description`, `tags[]`, `is_premium`

---

## 🛠️ Стъпки за Миграция

### 1. Подготовка на .md Файла

**Препоръчителна структура:**

```markdown
---
title: "Library Title"
category: "Library"
version: "1.0"
---

# 🥷 LIBRARY TITLE: ОПИСАНИЕ

> **Класификация:** ТАГОВЕ

## 🎯 Какво ще намериш тук?

Описание на библиотеката...

---

# ЧАСТ 1: MODULE NAME (XX PROMPTS)

## [1. Prompt Title]

🎯 **Difficulty:** ⭐⭐ | ⏱️ **Time:** 10-15 min | 🏷️ **Tags:** #tag1 #tag2

**Категория:** MODULE NAME  
**Описание:** Кратко описание на промпта

**The Prompt (Copy & Paste):**

```
Целият prompt text тук...
```

## [2. Next Prompt Title]
...

# ЧАСТ 2: NEXT MODULE (XX PROMPTS)
...
```

### 2. Създаване на Migration Script

Създайте TypeScript скрипт в `scripts/migrate-[library-name]-to-db.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 3. Parsing на Markdown Файла

**ВАЖНО:** Ключови моменти които научихме:

#### ✅ Използвайте Regex с `^` за начало на ред

```typescript
// ❌ ГРЕШНО - намира и в таблицата на съдържанието
const startIdx = content.indexOf('# ЧАСТ 1')

// ✅ ПРАВИЛНО - търси само в началото на ред
const startRegex = new RegExp('^' + startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'm')
const startMatch = content.match(startRegex)
const startIdx = startMatch ? startMatch.index! : -1
```

#### ✅ Използвайте пълния header с "(XX PROMPTS)"

```typescript
// По-специфичен маркер избягва съвпадения в таблицата
const module1 = extractPrompts(
  content, 
  '# ЧАСТ 1: CRYPTO & WEB3 ALPHA (20 PROMPTS)',
  '# ЧАСТ 2: BUSINESS & STRATEGY (20 PROMPTS)'
)
```

#### ✅ Regex за промпти трябва да е flexible

```typescript
// Optional номер в заглавието
const promptMatches = section.matchAll(/## \[(?:\d+\.\s*)?(.+?)\]/g)
```

#### ✅ Handling на Windows line endings (`\r\n`)

```typescript
// Промпт текст extraction
const codeBlockMatch = promptSection.match(/```\r?\n([\s\S]+?)\r?\n```/)
const prompt_text = codeBlockMatch ? codeBlockMatch[1].trim() : ''
```

### 4. Database Insertion Structure

```typescript
async function migrateToDatabase(data: ParsedLibrary) {
  // 1. Create library
  const { data: library } = await supabase
    .from('prompt_libraries')
    .insert({ title, slug, description, is_premium, order_index })
    .select()
    .single()

  // 2. Create "ПРЕГЛЕД" (Intro) module
  const { data: introModule } = await supabase
    .from('library_modules')
    .insert({
      library_id: library.id,
      title: 'ПРЕГЛЕД',
      subtitle: 'Начало и ориентиране',
      icon: '📖',
      order_index: 0
    })
    .select()
    .single()

  // 3. Insert intro content as module_section
  await supabase.from('module_sections').insert({
    module_id: introModule.id,
    title: 'Преглед',
    content: data.intro,
    section_type: 'narrative',
    order_index: 0
  })

  // 4. Create prompt modules (order_index starts at 1)
  for (let i = 0; i < data.modules.length; i++) {
    const { data: dbModule } = await supabase
      .from('library_modules')
      .insert({
        library_id: library.id,
        title: module.title,
        subtitle: module.subtitle,
        icon: module.icon,
        order_index: i + 1  // ВАЖНО: +1 заради intro module
      })
      .select()
      .single()

    // 5. Create category for module
    const { data: category } = await supabase
      .from('prompt_categories')
      .insert({
        module_id: dbModule.id,
        title: `${module.title} Prompts`,
        description: module.subtitle,
        order_index: 0
      })
      .select()
      .single()

    // 6. Insert prompts
    for (let pIndex = 0; pIndex < module.prompts.length; pIndex++) {
      await supabase.from('prompts').insert({
        category_id: category.id,
        title: prompt.title,
        prompt_text: prompt.prompt_text,
        description: prompt.description,
        tags: prompt.tags,
        is_premium: prompt.is_premium,
        order_index: pIndex
      })
    }
  }
}
```

---

## ⚠️ Често Срещани Проблеми и Решения

### Проблем 1: Regex не намира промпти в Module 1 и 2

**Причина:** `indexOf()` намира маркера в таблицата на съдържанието вместо в самата секция.

**Решение:** Използвайте regex с `^` (начало на ред):

```typescript
const startRegex = new RegExp('^' + marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'm')
```

### Проблем 2: Prompt text е празен или само "### SYSTEM INSTRUCTIONS..."

**Причина:** Regex очаква `\n` но файлът използва `\r\n` (Windows line endings).

**Решение:** Използвайте `\r?\n` във всички regex:

```typescript
/```\r?\n([\s\S]+?)\r?\n```/
```

### Проблем 3: Всички промпти са в последния модул

**Причина:** Секциите са определени грешно - таблицата на съдържанието се parse-ва вместо истинските секции.

**Решение:** Използвайте по-специфични маркери с "(XX PROMPTS)" в края.

### Проблем 4: Encoding проблеми с Cyrillic

**Причина:** SQL escape-ва специални символи неправилно.

**Решение:** Използвайте TypeScript migration script с Supabase client вместо raw SQL.

---

## 📝 Пълен Example Script

Вижте работещия пример в:
```
f:\Cyberninjas.net\web\scripts\migrate-elite-prompts-to-db.ts
```

### Ключови Features:

1. ✅ UTF-8 encoding - автоматично от Node.js `fs.readFile`
2. ✅ Regex с `^` за точно match-ване на headers
3. ✅ Handling на `\r\n` line endings
4. ✅ Progress tracking
5. ✅ Error handling
6. ✅ Flexible номерация на промпти

---

## 🚀 Как да Използвате

### Стъпка 1: Подготовка

```bash
# Инсталирайте dependencies (еднократно)
npm install tsx dotenv --save-dev
```

### Стъпка 2: Изтриване на Съществуващи Данни (ако update-вате)

```sql
-- В Supabase SQL Editor
DELETE FROM prompts WHERE category_id IN (
  SELECT id FROM prompt_categories WHERE module_id IN (
    SELECT id FROM library_modules WHERE library_id = 
    (SELECT id FROM prompt_libraries WHERE slug = 'your-library-slug')
  )
);

DELETE FROM module_sections WHERE module_id IN (
  SELECT id FROM library_modules WHERE library_id = 
  (SELECT id FROM prompt_libraries WHERE slug = 'your-library-slug')
);

DELETE FROM prompt_categories WHERE module_id IN (
  SELECT id FROM library_modules WHERE library_id = 
  (SELECT id FROM prompt_libraries WHERE slug = 'your-library-slug')
);

DELETE FROM library_modules WHERE library_id = 
  (SELECT id FROM prompt_libraries WHERE slug = 'your-library-slug');

DELETE FROM prompt_libraries WHERE slug = 'your-library-slug';
```

### Стъпка 3: Пускане на Migration

```bash
npx tsx scripts/migrate-your-library-to-db.ts
```

### Стъпка 4: Verification

1. Отворете `/dashboard/prompts/your-library-slug`
2. Проверете дали всички модули са налични
3. Проверете дали промптите са правилно разпределени
4. Отворете един промпт и проверете дали има **пълен prompt text**
5. Тествайте редактиране от админския панел

---

## 🎓 Best Practices

### 1. Винаги тествайте с малък subset първо

Създайте test script който вкарва само 1-2 промпта за debug.

### 2. Добавяйте logging

```typescript
console.log(`✅ Module ${i + 1}: ${module.title}`)
console.log(`   Found ${prompts.length} prompts`)
```

### 3. Използвайте transaction-safe операции

Supabase автоматично rollback-ва при грешка, но добавете `try/catch`:

```typescript
try {
  await migrateToDatabase(data)
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
}
```

### 4. Валидирайте данните преди DB insert

```typescript
if (!prompt.prompt_text || prompt.prompt_text.length < 10) {
  console.warn(`⚠️  Warning: Prompt "${prompt.title}" has no text!`)
}
```

---

## 📊 Database Schema Reference

### prompt_libraries

```sql
CREATE TABLE prompt_libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### library_modules

```sql
CREATE TABLE library_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_id UUID REFERENCES prompt_libraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  introduction TEXT,
  order_index INTEGER DEFAULT 0
);
```

### module_sections

```sql
CREATE TABLE module_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES library_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  section_type TEXT,
  order_index INTEGER DEFAULT 0
);
```

### prompt_categories

```sql
CREATE TABLE prompt_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES library_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0
);
```

### prompts

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES prompt_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  is_premium BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 Update Strategy

Ако трябва да update-нете съществуваща библиотека:

### Option 1: Full Replace (препоръчително)

1. Изтрийте цялата библиотека с SQL (вижте Стъпка 2)
2. Пуснете migration script отново
3. По-чисто и гарантира консистентност

### Option 2: Selective Update

1. Update-вайте само специфични промпти:

```typescript
await supabase
  .from('prompts')
  .update({ prompt_text: newText })
  .eq('id', promptId)
```

2. По-бързо но рискува orphan records

---

## ✅ Checklist След Миграция

- [ ] ПРЕГЛЕД модулът съществува и има intro content
- [ ] Всички модули са създадени с правилен `order_index`
- [ ] Промптите са разпределени правилно между модулите
- [ ] Всеки промпт има пълен `prompt_text` (не само заглавие)
- [ ] Tags са array, не string
- [ ] `is_premium` е boolean
- [ ] Frontend показва библиотеката на `/dashboard/prompts/[slug]`
- [ ] Админският панел позволява редактиране
- [ ] Промените се запазват в базата данни

---

## 📚 Допълнителни Ресурси

- **Supabase Docs**: https://supabase.com/docs
- **TypeScript Node.js**: https://nodejs.org/docs
- **Regex Testing**: https://regex101.com
- **Markdown Guide**: https://www.markdownguide.org

---

## 🙏 Credits

Създадено по време на миграцията на "60 Elite Master Prompts" библиотеката.
Дата: 2025-12-18

## 📧 Support

При проблеми, проверете:
1. `.env.local` има `NEXT_PUBLIC_SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`
2. MD файлът e в правилния формат
3. Node.js е версия 18+
4. Supabase connection работи

---

**Happy Migrating! 🚀**
