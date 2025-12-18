/**
 * Script to parse .txt prompt library files and upload to Supabase
 * 
 * Usage: node scripts/upload-prompt-libraries.js
 * 
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Library metadata mapping (filename -> library info)
const LIBRARY_METADATA: Record<string, {
    slug: string;
    title: string;
    description: string;
    is_premium: boolean;
    order_index: number;
}> = {
    'AI_Маркетинг_и_Експоненциален_Растеж.txt': {
        slug: 'ai-marketing-growth',
        title: 'AI Маркетинг и Експоненциален Растеж',
        description: 'Промптове за изграждане на автоматизирани маркетинг системи и постигане на експоненциален растеж с AI.',
        is_premium: false,
        order_index: 1
    },
    'Лично_Усъвършенстване_и_Продуктивност (2).txt': {
        slug: 'personal-development-productivity',
        title: 'Лично Усъвършенстване и Продуктивност',
        description: 'Промптове за личностно развитие, продуктивност и оптимизиране на ежедневието с AI.',
        is_premium: false,
        order_index: 2
    },
    'Оперативна_Ефективност_и_Автоматизация.txt': {
        slug: 'operations-automation',
        title: 'Оперативна Ефективност и Автоматизация',
        description: 'Промптове за оптимизиране на бизнес операции и внедряване на AI автоматизация.',
        is_premium: false,
        order_index: 3
    },
    'Продажби, Преговори и Убеждаване.txt': {
        slug: 'sales-negotiation',
        title: 'Продажби, Преговори и Убеждаване',
        description: 'Промптове за усъвършенстване на продажби, преговори и убеждаване с AI асистент.',
        is_premium: false,
        order_index: 4
    },
    'Продуктова Иновация и R&D.txt': {
        slug: 'product-innovation-rd',
        title: 'Продуктова Иновация и R&D',
        description: 'Промптове за продуктова разработка, иновации и научно-изследователска дейност.',
        is_premium: false,
        order_index: 5
    },
    'Стратегическо_познание_и_Лидерство.txt': {
        slug: 'strategic-thinking-leadership',
        title: 'Стратегическо Познание и Лидерство',
        description: 'Промптове за развитие на стратегическо мислене и лидерски умения.',
        is_premium: false,
        order_index: 6
    },
    'Талант, HR и Хибридни Екипи.txt': {
        slug: 'talent-hr-hybrid-teams',
        title: 'Талант, HR и Хибридни Екипи',
        description: 'Промптове за управление на човешки ресурси, наемане и работа с хибридни екипи.',
        is_premium: false,
        order_index: 7
    },
    'Финансова_Интелигентност_и_Макро_Анализ.txt': {
        slug: 'financial-intelligence-macro',
        title: 'Финансова Интелигентност и Макро Анализ',
        description: 'Промптове за финансов анализ, инвестиции и разбиране на макроикономически тенденции.',
        is_premium: false,
        order_index: 8
    }
};

interface ParsedPrompt {
    number: number;
    title: string;
    description: string;
    tips: string;
    promptText: string;
    context: string;
    howToUse: string;
}

function parsePromptLibrary(content: string): ParsedPrompt[] {
    const prompts: ParsedPrompt[] = [];

    // Normalize line endings to LF (Windows files use CRLF)
    const normalizedContent = content.replace(/\r\n/g, '\n');

    // Split by --- separator, keeping each prompt section
    // File format: ---\n### 1. Title\n...\n---\n### 2. Title...
    const sections = normalizedContent.split(/\n---\n/).filter(s => s.trim());

    console.log(`   Debug: Found ${sections.length} raw sections`);

    for (const section of sections) {
        if (!section.trim()) continue;

        // Extract prompt number and title (### 1. Title format)
        const titleMatch = section.match(/###\s+(\d+)\.\s+(.+?)(?:\r?\n|$)/);
        if (!titleMatch) {
            console.log(`   Debug: No title match in section starting with: ${section.substring(0, 50)}...`);
            continue;
        }

        const number = parseInt(titleMatch[1]);
        const title = titleMatch[2].trim();

        // Extract description (🎯 section)
        const descMatch = section.match(/\*\*🎯[^*]*\*\*[:\s]*\r?\n([\s\S]*?)(?=\*\*💡|\*\*💻|$)/);
        const description = descMatch ? cleanMarkdown(descMatch[1]) : '';

        // Extract tips (💡 section)
        const tipsMatch = section.match(/\*\*💡[^*]*\*\*[:\s]*\r?\n([\s\S]*?)(?=\*\*💻|$)/);
        const tips = tipsMatch ? cleanMarkdown(tipsMatch[1]) : '';

        // Extract prompt text (inside ``` blocks)
        const promptMatch = section.match(/```(?:text)?\s*\r?\n([\s\S]*?)```/);
        const promptText = promptMatch ? promptMatch[1].trim() : '';

        // Extract how to use (📝 section)
        const howToUseMatch = section.match(/📝\s*\*\*[^*]*\*\*[:\s]*\r?\n([\s\S]*?)(?=🚀|$)/);
        const howToUse = howToUseMatch ? cleanMarkdown(howToUseMatch[1]) : '';

        // Extract context (🚀 section)
        const contextMatch = section.match(/🚀\s*\*\*[^*]*\*\*[:\s]*\r?\n?([\s\S]*?)$/);
        const context = contextMatch ? cleanMarkdown(contextMatch[1]).trim() : '';

        if (title && promptText) {
            prompts.push({
                number,
                title,
                description,
                tips,
                promptText,
                context,
                howToUse
            });
        } else {
            console.log(`   Debug: Missing title or promptText for section ${number}: title="${title}", hasPrompt=${!!promptText}`);
        }
    }

    return prompts;
}

function cleanMarkdown(text: string): string {
    return text
        .replace(/^\s*\*\s*/gm, '') // Remove list bullets
        .replace(/\*\*/g, '')       // Remove bold markers
        .replace(/\r?\n\s*\r?\n/g, '\n')  // Collapse multiple newlines
        .trim();
}

async function uploadLibrary(filename: string, filePath: string) {
    const metadata = LIBRARY_METADATA[filename];
    if (!metadata) {
        console.log(`⚠️ Skipping ${filename} - no metadata defined`);
        return;
    }

    console.log(`\n📚 Processing: ${metadata.title}`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const prompts = parsePromptLibrary(content);

    console.log(`   Found ${prompts.length} prompts`);

    // 1. Create or update the library
    const { data: library, error: libError } = await supabase
        .from('prompt_libraries')
        .upsert({
            slug: metadata.slug,
            title: metadata.title,
            description: metadata.description,
            is_premium: metadata.is_premium,
            is_published: true,
            order_index: metadata.order_index
        }, { onConflict: 'slug' })
        .select()
        .single();

    if (libError) {
        console.error(`   ❌ Error creating library: ${libError.message}`);
        return;
    }

    console.log(`   ✅ Library created/updated: ${library.id}`);

    // 2. Create a single module for this library
    let moduleId: string | null = null;

    // First try to find existing module
    const { data: existingModule } = await supabase
        .from('library_modules')
        .select('id')
        .eq('library_id', library.id)
        .single();

    if (existingModule) {
        moduleId = existingModule.id;
        console.log(`   ✅ Using existing module: ${moduleId}`);
    } else {
        // Create new module
        const { data: newModule, error: modError } = await supabase
            .from('library_modules')
            .insert({
                library_id: library.id,
                title: 'Промптове',
                subtitle: `${prompts.length} професионални промпта`,
                icon: '🎯',
                order_index: 0
            })
            .select('id')
            .single();

        if (modError) {
            console.error(`   ❌ Error creating module: ${modError.message}`);
            return;
        }
        moduleId = newModule?.id;
        console.log(`   ✅ Module created: ${moduleId}`);
    }

    // 3. Create a single category for this module
    const { data: category, error: catError } = await supabase
        .from('prompt_categories')
        .insert({
            module_id: moduleId,
            title: metadata.title,
            description: metadata.description,
            order_index: 0
        })
        .select()
        .single();

    if (catError) {
        console.error(`   ❌ Error creating category: ${catError.message}`);
        return;
    }

    console.log(`   ✅ Category created: ${category.id}`);

    // 4. Insert all prompts
    for (const prompt of prompts) {
        const { error: promptError } = await supabase
            .from('prompts')
            .insert({
                category_id: category.id,
                title: prompt.title,
                prompt_text: prompt.promptText,
                description: prompt.description,
                usage_tips: prompt.tips + (prompt.howToUse ? '\n\n' + prompt.howToUse : ''),
                expected_result: prompt.context,
                tags: [],
                is_premium: false,
                order_index: prompt.number
            });

        if (promptError) {
            console.error(`   ❌ Error inserting prompt "${prompt.title}": ${promptError.message}`);
        } else {
            console.log(`   ✅ Prompt ${prompt.number}: ${prompt.title.substring(0, 40)}...`);
        }
    }

    console.log(`   🎉 Completed ${metadata.title} with ${prompts.length} prompts`);
}

async function main() {
    const contentDir = path.join(__dirname, '../Content');

    console.log('🚀 Starting Prompt Library Upload');
    console.log(`📁 Content directory: ${contentDir}`);

    const files = fs.readdirSync(contentDir)
        .filter(f => f.endsWith('.txt') && LIBRARY_METADATA[f]);

    console.log(`\n📋 Found ${files.length} library files to process`);

    for (const file of files) {
        await uploadLibrary(file, path.join(contentDir, file));
    }

    console.log('\n✅ Upload complete!');
}

main().catch(console.error);
