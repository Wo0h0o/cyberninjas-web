#!/usr/bin/env tsx
/**
 * Elite Prompts DB Migration Script
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ParsedPrompt {
    title: string
    description: string
    prompt_text: string
    tags: string[]
    is_premium: boolean
}

interface ParsedModule {
    title: string
    subtitle: string
    icon: string
    prompts: ParsedPrompt[]
}

async function parseMarkdownFile() {
    console.log('📖 Reading MD file...')

    const filePath = path.join(process.cwd(), 'Content', '60 Elite Master Prompts.md')
    const content = await fs.promises.readFile(filePath, 'utf-8')

    const lines = content.split('\n')

    // Extract intro (everything before "# ЧАСТ 1:")
    let introLines: string[] = []
    let i = 0
    while (i < lines.length && !lines[i].match(/^# ЧАСТ \d+:/)) {
        introLines.push(lines[i])
        i++
    }

    const intro = introLines.join('\n').trim()

    // Parse modules
    const modules: ParsedModule[] = []

    // Module 1: CRYPTO & WEB3 ALPHA
    const module1Prompts = extractPrompts(content, '# ЧАСТ 1: CRYPTO & WEB3 ALPHA (20 PROMPTS)', '# ЧАСТ 2: BUSINESS & STRATEGY (20 PROMPTS)')
    modules.push({
        title: 'CRYPTO & WEB3 ALPHA',
        subtitle: 'Професионални инструменти за анализ и стратегия',
        icon: '💎',
        prompts: module1Prompts
    })

    // Module 2: BUSINESS & STRATEGY
    const module2Prompts = extractPrompts(content, '# ЧАСТ 2: BUSINESS & STRATEGY (20 PROMPTS)', '# ЧАСТ 3: WEB3 TRADING & DEV MASTERY (20 PROMPTS)')
    modules.push({
        title: 'BUSINESS & STRATEGY',
        subtitle: 'Инструменти за бизнес развитие и мениджмънт',
        icon: '🚀',
        prompts: module2Prompts
    })

    // Module 3: WEB3 TRADING & DEV MASTERY
    const module3Prompts = extractPrompts(content, '# ЧАСТ 3: WEB3 TRADING & DEV MASTERY (20 PROMPTS)', '<<<END>>>')
    modules.push({
        title: 'WEB3 TRADING & DEV MASTERY',
        subtitle: 'Технически анализ и Solidity разработка',
        icon: '⚡',
        prompts: module3Prompts
    })

    console.log(`✅ Parsed: ${modules.length} modules`)
    console.log(`✅ Module 1: ${modules[0].prompts.length} prompts`)
    console.log(`✅ Module 2: ${modules[1].prompts.length} prompts`)
    console.log(`✅ Module 3: ${modules[2].prompts.length} prompts`)

    return { intro, modules }
}

function extractPrompts(content: string, startMarker: string, endMarker: string): ParsedPrompt[] {
    // Use regex to find markers at start of line only
    const startRegex = new RegExp('^' + startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'm')
    const startMatch = content.match(startRegex)
    const startIdx = startMatch ? startMatch.index! : -1

    let endIdx = content.length
    if (endMarker !== '<<<END>>>') {
        const endRegex = new RegExp('^' + endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'm')
        const endMatch = content.match(endRegex)
        endIdx = endMatch ? endMatch.index! : content.length
    }

    console.log(`   🔍 Looking for: "${startMarker}"`)
    console.log(`   📍 Start index: ${startIdx}, End index: ${endIdx}`)

    if (startIdx === -1) {
        console.log(`   ❌ Start marker not found!`)
        return []
    }

    const section = content.substring(startIdx, endIdx)
    const prompts: ParsedPrompt[] = []

    // Split by "## [Title]" - number is optional
    const promptMatches = section.matchAll(/## \[(?:\d+\.\s*)?(.+?)\]/g)
    const matches = Array.from(promptMatches)

    console.log(`   ✅ Found ${matches.length} prompts in this section\n`)

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i]
        const title = match[1] // Title is now in group 1
        const startPos = match.index!
        const endPos = i < matches.length - 1 ? matches[i + 1].index! : section.length

        const promptSection = section.substring(startPos, endPos)

        // Extract description
        const descMatch = promptSection.match(/\*\*Описание:\*\*\s*(.+?)(?=\n\n|\*\*|$)/s)
        const description = descMatch ? descMatch[1].trim() : ''

        // Extract prompt text (between ``` markers) - handle both \n and \r\n
        const codeBlockMatch = promptSection.match(/```\r?\n([\s\S]+?)\r?\n```/)
        const prompt_text = codeBlockMatch ? codeBlockMatch[1].trim() : ''

        // Extract tags
        const tagsMatch = promptSection.match(/🏷️\s*\*\*Tags:\*\*\s*(.+)/i)
        let tags: string[] = []
        if (tagsMatch) {
            tags = tagsMatch[1].split(/[,\s]+/)
                .map(t => t.replace('#', '').toLowerCase().trim())
                .filter(t => t.length > 0)
        }

        // Check if premium (most are, unless explicitly marked otherwise)
        const is_premium = !promptSection.toLowerCase().includes('достъп: безплатен')

        prompts.push({
            title,
            description,
            prompt_text,
            tags,
            is_premium
        })
    }

    return prompts
}

async function migrateToDatabase(data: { intro: string; modules: ParsedModule[] }) {
    console.log('\n🚀 Starting migration...\n')

    // Create library
    console.log('1️⃣  Creating library...')
    const { data: library, error: libError } = await supabase
        .from('prompt_libraries')
        .insert({
            title: '60 Elite Master Prompts',
            slug: 'elite-master-prompts',
            description: 'Операционни инструменти за елитни кибер нинджи',
            is_premium: true,
            order_index: 0,
        })
        .select()
        .single()

    if (libError) throw libError
    console.log(`✅ Library: ${library.id}`)

    // Create "ПРЕГЛЕД" module for intro
    console.log('\n2️⃣  Creating modules...')
    const { data: introModule, error: introModError } = await supabase
        .from('library_modules')
        .insert({
            library_id: library.id,
            title: 'ПРЕГЛЕД',
            subtitle: 'Начало и ориентиране в библиотеката',
            icon: '📖',
            introduction: '',
            order_index: 0,
        })
        .select()
        .single()

    if (introModError) throw introModError
    console.log(`   ✅ Module 0: ПРЕГЛЕД`)

    // Insert intro content
    await supabase.from('module_sections').insert({
        module_id: introModule.id,
        title: 'Преглед',
        content: data.intro,
        section_type: 'narrative',
        order_index: 0,
    })

    // Create prompt modules
    const modules = []
    for (let i = 0; i < data.modules.length; i++) {
        const module = data.modules[i]
        const { data: dbModule, error } = await supabase
            .from('library_modules')
            .insert({
                library_id: library.id,
                title: module.title,
                subtitle: module.subtitle,
                icon: module.icon,
                introduction: '',
                order_index: i + 1, // +1 because intro is 0
            })
            .select()
            .single()

        if (error) throw error
        modules.push(dbModule)
        console.log(`   ✅ Module ${i + 1}: ${module.title}`)
    }

    // Create prompts
    console.log('\n3️⃣  Creating prompts...')
    let totalPrompts = 0

    for (let modIndex = 0; modIndex < data.modules.length; modIndex++) {
        const module = data.modules[modIndex]
        const dbModule = modules[modIndex]

        // Create category
        const { data: category, error: catError } = await supabase
            .from('prompt_categories')
            .insert({
                module_id: dbModule.id,
                title: `${module.title} Prompts`,
                description: module.subtitle,
                order_index: 0,
            })
            .select()
            .single()

        if (catError) throw catError

        // Insert prompts
        for (let pIndex = 0; pIndex < module.prompts.length; pIndex++) {
            const prompt = module.prompts[pIndex]

            await supabase.from('prompts').insert({
                category_id: category.id,
                title: prompt.title,
                prompt_text: prompt.prompt_text,
                description: prompt.description,
                tags: prompt.tags,
                is_premium: prompt.is_premium,
                order_index: pIndex,
            })

            totalPrompts++
            process.stdout.write(`\r   Progress: ${totalPrompts}/60 prompts...`)
        }
    }

    console.log(`\n\n✅ Migration complete! Total: ${totalPrompts}/60\n`)
}

async function main() {
    try {
        const data = await parseMarkdownFile()
        await migrateToDatabase(data)
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

main()
