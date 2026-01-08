'use client'

import React from 'react'

// Brand Colors
const BRAND = {
    yellow: '#FFFF00',
    yellowMuted: '#E6E600',
    green: '#22C55E',
    greenBg: 'rgba(34, 197, 94, 0.15)',
    red: '#EF4444',
    redBg: 'rgba(239, 68, 68, 0.15)',
    blue: '#3B82F6',
    blueBg: 'rgba(59, 130, 246, 0.15)',
    purple: '#A855F7',
    purpleBg: 'rgba(168, 85, 247, 0.1)',
    surface: '#1A1A1A',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
}

// Framework and methodology names get yellow highlight
const HIGHLIGHT_TERMS = [
    // Core frameworks
    'Р-К-З-О',
    'Верига на Мисълта',
    'РАГ',
    'Човек в Цикъла',
    'Цикъл на Отхвърляне',
    'Матрица на Делегиране',
    'Мулти-Агент Оркестрация',
    'Прототипиране от Скица',
    // Methodology names
    'Предсмъртен Анализ',
    'Състезателно Мислене',
    'Механизъм на Вниманието',
    'Мултиглаво Внимание',
    'Грануларност на контрола',
    // Key concepts
    'Халюцинация',
    'Калибрация',
    'Свръх-агентност',
]

interface RichContentProps {
    content: string
}

export function RichContent({ content }: RichContentProps) {
    const blocks = parseContent(content)

    return (
        <div className="rich-content">
            {blocks.map((block, index) => (
                <ContentBlock key={index} block={block} />
            ))}
        </div>
    )
}

interface ContentBlockData {
    type: 'paragraph' | 'good' | 'bad' | 'tip' | 'heading' | 'subheading' | 'fullGradient' | 'list' | 'quote' | 'code'
    content: string
    subtitle?: string
    items?: string[]
}

function parseContent(content: string): ContentBlockData[] {
    const lines = content.split('\n')
    const blocks: ContentBlockData[] = []
    let currentList: string[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Skip empty lines
        if (!line) {
            if (currentList.length > 0) {
                blocks.push({ type: 'list', content: '', items: currentList })
                currentList = []
            }
            continue
        }

        // Good example - green block
        if (line.startsWith('• Добър:') || line.startsWith('Добър:') ||
            line.includes('✓ Добър') || line.includes('✓ Добре')) {
            flushList()
            const cleanContent = line
                .replace(/^[•\s]*Добър[а]?:\s*/i, '')
                .replace(/✓ Добър[а]?:?\s*/i, '')
                .replace(/✓ Добре:?\s*/i, '')
                .trim()
            blocks.push({ type: 'good', content: cleanContent })
        }
        // Bad example - red block
        else if (line.startsWith('• Лош:') || line.startsWith('Лош:') ||
            line.includes('✗ Лош') || line.includes('✗ Лошо')) {
            flushList()
            const cleanContent = line
                .replace(/^[•\s]*Лош[а]?:\s*/i, '')
                .replace(/✗ Лош[а]?:?\s*/i, '')
                .replace(/✗ Лошо:?\s*/i, '')
                .trim()
            blocks.push({ type: 'bad', content: cleanContent })
        }
        // Tip/Hint - blue block (expanded patterns)
        else if (line.includes('💡') ||
            line.startsWith('Съвет:') ||
            line.startsWith('Важно:') ||
            line.startsWith('Забележка:') ||
            line.startsWith('Ефект:') ||
            line.startsWith('Защо работи') ||
            line.includes('Фундаменталният принцип') ||
            line.includes('Ключов момент')) {
            flushList()
            const cleanContent = line
                .replace(/^💡\s*/, '')
                .replace(/^Съвет:\s*/i, '')
                .replace(/^Важно:\s*/i, '')
                .replace(/^Забележка:\s*/i, '')
                .trim()
            blocks.push({ type: 'tip', content: cleanContent || line })
        }
        // Code/Prompt block - yellow block (multi-line support)
        else if (line.startsWith('Промпт:') || line.startsWith('Пример Промпт:')) {
            flushList()
            let promptContent = line
                .replace(/^Промпт:\s*/i, '')
                .replace(/^Пример Промпт:\s*/i, '')
                .trim()

            // Collect multi-line prompt content until КРАЙ_ПРОМПТ or empty line followed by non-prompt content
            let j = i + 1
            while (j < lines.length) {
                const nextLine = lines[j].trim()
                if (nextLine === 'КРАЙ_ПРОМПТ' || nextLine === '') {
                    if (nextLine === 'КРАЙ_ПРОМПТ') {
                        i = j // Skip the end marker
                    }
                    break
                }
                promptContent += '\n' + nextLine
                i = j
                j++
            }

            blocks.push({ type: 'code', content: promptContent })
        }
        // Bullet list
        else if (line.startsWith('•') || line.match(/^\d+\./)) {
            const item = line.replace(/^[•]\s*/, '').replace(/^\d+\.\s*/, '')

            // Check if bullet item is a good/bad example
            if (item.startsWith('Добър:') || item.startsWith('Лош:')) {
                flushList()
                if (item.startsWith('Добър:')) {
                    blocks.push({ type: 'good', content: item.replace(/^Добър:\s*/i, '') })
                } else {
                    blocks.push({ type: 'bad', content: item.replace(/^Лош:\s*/i, '') })
                }
            } else {
                currentList.push(item)
            }
        }
        // Subheading pattern: "Term: Subtitle" (concept introduction)
        else if (line.match(/^[А-Яа-яA-Za-z\s]+:\s[А-Яа-яA-Za-z]/) &&
            line.length < 80 &&
            !line.startsWith('•') &&
            !line.includes('Добър:') &&
            !line.includes('Лош:')) {
            flushList()
            const colonIndex = line.indexOf(':')
            const term = line.substring(0, colonIndex).trim()
            const subtitle = line.substring(colonIndex + 1).trim()
            blocks.push({ type: 'subheading', content: term, subtitle })
        }
        // Standalone section title (short line, capitalized, no sentence punctuation at end)
        else if (line.length > 8 &&
            line.length < 70 &&
            !line.endsWith('.') &&
            !line.endsWith('?') &&
            !line.endsWith('!') &&
            !line.startsWith('•') &&
            !line.startsWith('Отговор:') &&
            !line.includes('Добър') &&
            !line.includes('Лош') &&
            line.match(/^[А-Яа-яA-Za-z0-9][а-яА-ЯA-Za-z0-9\s\-,\(\)\":]+$/)) {
            flushList()
            // Remove trailing colon if present
            const cleanLine = line.replace(/:$/, '')
            blocks.push({ type: 'subheading', content: cleanLine, subtitle: '' })
        }
        // Simple heading (specific patterns for section titles)
        else if (line.endsWith(':') && line.length < 60 && !line.includes('.')) {
            flushList()
            blocks.push({ type: 'heading', content: line.replace(/:$/, '') })
        }
        // Full gradient line (lines with em-dash like "Роля — ...")
        else if (line.includes(' — ') && line.length < 100 && !line.startsWith('•')) {
            flushList()
            blocks.push({ type: 'fullGradient', content: line })
        }
        // Quote (line in quotes - usually prompts)
        else if (line.startsWith('"') && line.endsWith('"') && line.length > 20) {
            flushList()
            blocks.push({ type: 'code', content: line })
        }
        // Regular paragraph
        else {
            flushList()
            blocks.push({ type: 'paragraph', content: line })
        }
    }

    flushList()
    return blocks

    function flushList() {
        if (currentList.length > 0) {
            blocks.push({ type: 'list', content: '', items: currentList })
            currentList = []
        }
    }
}

function ContentBlock({ block }: { block: ContentBlockData }) {
    switch (block.type) {
        case 'good':
            return (
                <div style={{
                    padding: '14px 18px',
                    backgroundColor: BRAND.greenBg,
                    borderLeft: `4px solid ${BRAND.green}`,
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '12px',
                }}>
                    <span style={{ color: BRAND.green, fontWeight: 700, marginRight: '10px' }}>✓ Добре:</span>
                    <span style={{ color: BRAND.textPrimary }}>{block.content}</span>
                </div>
            )

        case 'bad':
            return (
                <div style={{
                    padding: '14px 18px',
                    backgroundColor: BRAND.redBg,
                    borderLeft: `4px solid ${BRAND.red}`,
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '12px',
                }}>
                    <span style={{ color: BRAND.red, fontWeight: 700, marginRight: '10px' }}>✗ Лошо:</span>
                    <span style={{ color: BRAND.textPrimary }}>{block.content}</span>
                </div>
            )

        case 'tip':
            return (
                <div style={{
                    padding: '14px 18px',
                    backgroundColor: BRAND.blueBg,
                    borderLeft: `4px solid ${BRAND.blue}`,
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '12px',
                }}>
                    <span style={{ color: BRAND.blue, fontWeight: 700, marginRight: '10px' }}>💡 Съвет:</span>
                    <span style={{ color: BRAND.textPrimary }}>{block.content}</span>
                </div>
            )

        case 'code':
            return (
                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#0D0D0D',
                    border: `1px solid ${BRAND.yellow}40`,
                    borderLeft: `4px solid ${BRAND.yellow}`,
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '12px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    overflowX: 'auto',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                }}>
                    <span style={{ color: BRAND.textSecondary, fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                        📝 Промпт
                    </span>
                    {block.content}
                </div>
            )

        case 'subheading':
            return (
                <div style={{
                    marginTop: '32px',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: `2px solid ${BRAND.yellow}40`,
                }}>
                    <span style={{
                        background: `linear-gradient(135deg, ${BRAND.yellow} 0%, #FFD700 50%, #FFA500 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                    }}>
                        {block.content}
                    </span>
                    {block.subtitle && (
                        <span style={{
                            color: BRAND.textSecondary,
                            fontSize: '1rem',
                            fontWeight: 400,
                            marginLeft: '10px',
                        }}>
                            — {block.subtitle}
                        </span>
                    )}
                </div>
            )

        case 'heading':
            return (
                <h4 style={{
                    color: '#fff',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    marginTop: '28px',
                    marginBottom: '14px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #333',
                }}>
                    {block.content}
                </h4>
            )

        case 'fullGradient':
            return (
                <div style={{
                    marginTop: '20px',
                    marginBottom: '12px',
                }}>
                    <span style={{
                        background: `linear-gradient(135deg, ${BRAND.yellow} 0%, #FFD700 50%, #FFA500 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        letterSpacing: '0.3px',
                    }}>
                        {block.content}
                    </span>
                </div>
            )

        case 'list':
            return (
                <ul style={{
                    margin: '0 0 16px 0',
                    paddingLeft: '24px',
                    listStyle: 'none',
                }}>
                    {block.items?.map((item, i) => (
                        <li key={i} style={{
                            color: BRAND.textPrimary,
                            marginBottom: '10px',
                            paddingLeft: '8px',
                            position: 'relative',
                            lineHeight: 1.7,
                        }}>
                            <span style={{
                                position: 'absolute',
                                left: '-16px',
                                color: BRAND.textSecondary,
                            }}>•</span>
                            {highlightTerms(item, true)}
                        </li>
                    ))}
                </ul>
            )

        case 'quote':
            return (
                <blockquote style={{
                    padding: '14px 20px',
                    backgroundColor: BRAND.purpleBg,
                    borderLeft: `4px solid ${BRAND.purple}`,
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '12px',
                    fontStyle: 'italic',
                    color: BRAND.textPrimary,
                }}>
                    {block.content}
                </blockquote>
            )

        case 'paragraph':
        default:
            return (
                <p style={{
                    color: BRAND.textPrimary,
                    lineHeight: 1.85,
                    marginBottom: '16px',
                }}>
                    {highlightTerms(block.content, false)}
                </p>
            )
    }
}

function highlightTerms(text: string, isInline: boolean = false): React.ReactNode {
    // First, process markdown bold (**text**) patterns
    const boldRegex = /\*\*([^*]+)\*\*/g
    const segments: { text: string; isBold: boolean }[] = []
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({ text: text.slice(lastIndex, match.index), isBold: false })
        }
        // Add the bold text (without asterisks)
        segments.push({ text: match[1], isBold: true })
        lastIndex = match.index + match[0].length
    }
    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({ text: text.slice(lastIndex), isBold: false })
    }

    // If no bold patterns found, use original text
    if (segments.length === 0) {
        segments.push({ text, isBold: false })
    }

    // Now process each segment for highlight terms
    return segments.map((segment, segIndex) => {
        if (segment.isBold) {
            // Render bold text with gradient
            // For inline (list items), use smaller styling
            // For standalone (paragraphs), use heading styling
            const style = isInline ? {
                background: `linear-gradient(135deg, ${BRAND.yellow} 0%, #FFD700 50%, #FFA500 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
            } : {
                display: 'block' as const,
                background: `linear-gradient(135deg, ${BRAND.yellow} 0%, #FFD700 50%, #FFA500 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
                fontSize: '1.15rem',
                marginTop: '24px',
                marginBottom: '12px',
                letterSpacing: '0.3px',
            }
            return (
                <span key={`bold-${segIndex}`} style={style}>
                    {segment.text}
                </span>
            )
        }

        // For non-bold text, apply highlight terms
        if (HIGHLIGHT_TERMS.length === 0) return segment.text

        const pattern = HIGHLIGHT_TERMS.map(term =>
            term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ).join('|')

        const regex = new RegExp(`(${pattern})`, 'gi')
        const parts = segment.text.split(regex)

        return parts.map((part, i) => {
            const isHighlighted = HIGHLIGHT_TERMS.some(term =>
                part.toLowerCase() === term.toLowerCase()
            )

            if (isHighlighted) {
                return (
                    <span key={`${segIndex}-${i}`} style={{
                        color: BRAND.yellow,
                        fontWeight: 700,
                    }}>
                        {part}
                    </span>
                )
            }
            return part
        })
    })
}
