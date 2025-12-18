'use server'

import fs from 'fs'
import path from 'path'

export interface ElitePrompt {
    id: string
    title: string
    difficulty: string
    time: string
    tags: string[]
    description: string
    prompt_text: string
    category_name: string
    is_premium: boolean
}

export interface EliteModule {
    id: string
    title: string
    subtitle: string
    icon: string
    prompts: ElitePrompt[]
}

export interface EliteLibraryData {
    title: string
    intro: string
    modules: EliteModule[]
}

export async function getElitePrompts(): Promise<EliteLibraryData> {
    const filePath = path.join(process.cwd(), 'Content', '60 Elite Master Prompts.md')
    const fileContent = await fs.promises.readFile(filePath, 'utf-8')
    const lines = fileContent.split('\n')

    const data: EliteLibraryData = {
        title: "60 Elite Master Prompts",
        intro: "",
        modules: []
    }

    // 1. Separate Intro and Body
    // Intro is everything before the first module header "# ЧАСТ"
    let introLines: string[] = []
    let bodyLines: string[] = []
    let isIntro = true

    for (const line of lines) {
        if (line.trim().startsWith('# ЧАСТ')) {
            isIntro = false
        }

        if (isIntro) {
            introLines.push(line)
        } else {
            bodyLines.push(line)
        }
    }

    data.intro = introLines.join('\n')

    // 2. Parse Modules
    const moduleChunks = bodyLines.join('\n').split(/^# ЧАСТ/m).filter(chunk => chunk.trim().length > 0)

    data.modules = moduleChunks.map((chunk, index) => {
        const chunkLines = chunk.trim().split('\n')
        const header = chunkLines[0] // e.g. "1: CRYPTO & WEB3 ALPHA (20 PROMPTS)"
        const content = chunkLines.slice(1).join('\n')

        // Clean title
        const titleMatch = header.match(/^\d*:\s*(.+?)\s*\((\d+)\s*PROMPTS\)/i) || header.match(/^\d*:\s*(.+)/)
        const title = titleMatch ? titleMatch[1].trim() : header.trim()

        let id = `module-${index + 1}`
        let icon = "⚡"
        let subtitle = ""

        if (title.toLowerCase().includes("crypto")) {
            id = "crypto-alpha"
            icon = "💎"
            subtitle = "Професионални инструменти за анализ и стратегия"
        } else if (title.toLowerCase().includes("business")) {
            id = "business-strategy"
            icon = "🚀"
            subtitle = "Инструменти за бизнес развитие и мениджмънт"
        } else if (title.toLowerCase().includes("trading") || title.toLowerCase().includes("dev")) {
            id = "web3-mastery"
            icon = "⚡"
            subtitle = "Технически анализ и Solidity разработка"
        }

        // 3. Parse Prompts within Module
        const promptChunks = content.split(/^## \[/m).slice(1) // Skip text before first prompt

        const prompts: ElitePrompt[] = promptChunks.map(pChunk => {
            const pLines = pChunk.split('\n')

            // Title line: "1. Пълен Одит...]"
            const rawTitle = pLines[0].replace(/\]\s*$/, '').trim() // Remove trailing ]
            // Extract Number and Title
            const titleParts = rawTitle.match(/^(\d+)\.\s*(.+)/)
            const promptId = titleParts ? titleParts[1] : rawTitle
            const promptTitle = titleParts ? titleParts[2] : rawTitle

            const fullText = pLines.slice(1).join('\n')

            // Extract Metadata
            const diffMatch = fullText.match(/\*\*Difficulty:\*\*\s*(.+?)\s*\|/)
            const timeMatch = fullText.match(/\*\*Time:\*\*\s*(.+?)\s*\|/)
            const tagsMatch = fullText.match(/\*\*Tags:\*\*\s*(.+)/)

            // Extract Description
            const descMatch = fullText.match(/\*\*Описание:\*\*\s*(.+)/)

            // Extract Prompt Text (Code Block)
            const codeBlockMatch = fullText.match(/```([\s\S]*?)```/)

            return {
                id: promptId,
                title: promptTitle,
                difficulty: diffMatch ? diffMatch[1].replace(/⭐/g, '').trim() : "Intermediate",
                time: timeMatch ? timeMatch[1].replace('min', '').trim() + ' min' : "10 min",
                tags: tagsMatch ? tagsMatch[1].split(' ').filter(t => t.startsWith('#')) : [],
                description: descMatch ? descMatch[1].trim() : "",
                prompt_text: codeBlockMatch ? codeBlockMatch[1].trim() : "",
                category_name: title,
                is_premium: true
            }
        })

        return {
            id,
            title,
            subtitle,
            icon,
            prompts
        }
    })

    return data
}
