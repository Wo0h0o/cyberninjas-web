'use client'

import { useState, use, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { clsx } from 'clsx'
import { usePromptLibrary, useFavorites } from '@/hooks/usePrompts'
import { useUserLevel } from '@/hooks/useUserLevel'
import type { Prompt, ModuleSection } from '@/lib/types'

interface LibraryPageProps {
    params: Promise<{ slug: string }>
}

// Markdown-like rendering for section content
function MarkdownContent({ content }: { content: string }) {
    const lines = content.split('\n')

    return (
        <div className="space-y-3">
            {lines.map((line, i) => {
                if (line.startsWith('## ')) {
                    return <h3 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h3>
                }

                if (line.match(/^[\*\-]\s/)) {
                    const text = line.slice(2)
                    return (
                        <div key={i} className="flex gap-3 pl-2">
                            <span className="text-accent-yellow mt-1">•</span>
                            <span className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                                __html: text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                            }} />
                        </div>
                    )
                }

                if (line.match(/^\d+\.\s/)) {
                    const num = line.match(/^(\d+)\./)?.[1]
                    const text = line.replace(/^\d+\.\s/, '')
                    return (
                        <div key={i} className="flex gap-3 pl-2">
                            <span className="text-accent-yellow font-bold min-w-[24px]">{num}.</span>
                            <span className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                                __html: text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                            }} />
                        </div>
                    )
                }

                if (!line.trim()) {
                    return <div key={i} className="h-4" />
                }

                return (
                    <p key={i} className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                        __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    }} />
                )
            })}
        </div>
    )
}

// Section component with collapsible content
function SectionCard({ section }: { section: ModuleSection }) {
    const [isExpanded, setIsExpanded] = useState(true)

    const typeStyles = {
        narrative: {
            border: 'border-accent-yellow/20',
            bg: 'bg-gradient-to-br from-accent-yellow/10 to-accent-yellow/5',
            icon: '📖',
            label: 'Теория'
        },
        instructions: {
            border: 'border-blue-500/20',
            bg: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
            icon: '📋',
            label: 'Инструкции'
        },
        example: {
            border: 'border-green-500/20',
            bg: 'bg-gradient-to-br from-green-500/10 to-green-500/5',
            icon: '💡',
            label: 'Пример'
        },
        warning: {
            border: 'border-amber-500/20',
            bg: 'bg-gradient-to-br from-amber-500/10 to-amber-500/5',
            icon: '⚠️',
            label: 'Важно'
        }
    }

    const style = typeStyles[section.section_type]

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                'rounded-2xl border overflow-hidden',
                style.border,
                style.bg
            )}
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{style.icon}</span>
                    <h4 className="font-semibold text-white text-lg text-left">
                        {section.title || style.label}
                    </h4>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2">
                            <MarkdownContent content={section.content} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// Prompt Card component
function PromptCard({
    prompt,
    onSelect,
    isFavorite
}: {
    prompt: Prompt
    onSelect: () => void
    isFavorite: boolean
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onSelect}
            className="w-full text-left p-5 rounded-2xl border bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-accent-yellow/30 transition-all group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20 flex items-center justify-center shrink-0 group-hover:from-accent-yellow/30 group-hover:to-accent-yellow-hover/30 transition-colors">
                        <span className="text-xl">📝</span>
                    </div>
                    <div>
                        <div className="font-semibold text-white text-lg mb-1 group-hover:text-accent-yellow transition-colors">{prompt.title}</div>
                        {prompt.description && (
                            <div className="text-sm text-gray-400 line-clamp-2">
                                {prompt.description}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isFavorite && (
                        <div className="text-red-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                        </div>
                    )}
                    {prompt.is_premium && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                            PRO
                        </span>
                    )}
                </div>
            </div>
        </motion.button>
    )
}

// Prompt Modal Component
function PromptModal({
    prompt,
    onClose,
    isFavorite,
    onToggleFavorite
}: {
    prompt: Prompt
    onClose: () => void
    isFavorite: boolean
    onToggleFavorite: () => void
}) {
    const [copied, setCopied] = useState(false)
    const { addXP } = useUserLevel()

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [onClose])

    const copyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(prompt.prompt_text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)

            // Award XP for copying prompt
            await addXP(5, 'Copied prompt')
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 shadow-2xl shadow-accent-yellow/10 overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/10 bg-gradient-to-r from-accent-yellow/10 to-accent-yellow-hover/10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-yellow/30 to-accent-yellow-hover/30 flex items-center justify-center shrink-0">
                                <span className="text-2xl">📝</span>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{prompt.title}</h2>
                                {prompt.description && (
                                    <p className="text-gray-400 mt-2 leading-relaxed">{prompt.description}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
                    {/* Prompt Code */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span>📋</span> Промпт за копиране
                        </h4>
                        <div className="relative">
                            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 font-mono text-sm text-gray-200 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                                {prompt.prompt_text}
                            </div>
                        </div>
                    </div>

                    {/* Usage Tips */}
                    {prompt.usage_tips && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span>💡</span> Как да използваш
                            </h4>
                            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <p className="text-gray-300 leading-relaxed">{prompt.usage_tips}</p>
                            </div>
                        </div>
                    )}

                    {/* Expected Result */}
                    {prompt.expected_result && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span>🎯</span> Очакван резултат
                            </h4>
                            <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
                                <p className="text-gray-300 leading-relaxed">{prompt.expected_result}</p>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span>🏷️</span> Тагове
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {prompt.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-4 py-2 rounded-full bg-accent-yellow/10 text-accent-yellow text-sm border border-accent-yellow/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="p-6 md:p-8 border-t border-white/10 bg-black/30 flex items-center gap-4">
                    <button
                        onClick={copyPrompt}
                        className={clsx(
                            'flex-1 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3',
                            copied
                                ? 'bg-green-500 text-white'
                                : 'bg-accent-yellow text-text-on-yellow hover:opacity-90 hover:shadow-lg hover:shadow-accent-yellow/25'
                        )}
                    >
                        {copied ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                Копирано!
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                                Копирай промпта
                            </>
                        )}
                    </button>

                    <button
                        onClick={onToggleFavorite}
                        className={clsx(
                            'p-4 rounded-2xl border transition-all',
                            isFavorite
                                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function LibraryPage({ params }: LibraryPageProps) {
    const resolvedParams = use(params)

    const { library, loading, error } = usePromptLibrary(resolvedParams.slug)
    const { isFavorite, toggleFavorite } = useFavorites()

    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

    // Set default module when library loads
    if (library && !selectedModuleId && library.modules.length > 0) {
        setSelectedModuleId(library.modules[0].id)
    }

    // Get current module
    const currentModule = library?.modules.find(m => m.id === selectedModuleId)

    // Handle favorite toggle
    const handleToggleFavorite = async () => {
        if (!selectedPrompt) return
        await toggleFavorite(selectedPrompt.id)
    }

    if (loading) {
        return (
            <div className="flex gap-8 h-[calc(100vh-120px)]">
                <div className="w-80 rounded-2xl bg-white/[0.03] animate-pulse" />
                <div className="flex-1 rounded-2xl bg-white/[0.03] animate-pulse" />
            </div>
        )
    }

    if (error || !library) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Библиотеката не е намерена</h2>
                <Link href="/dashboard/prompts" className="text-accent-yellow hover:text-accent-yellow-hover">
                    ← Обратно към промптове
                </Link>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/dashboard/prompts" className="text-gray-400 hover:text-white transition-colors">
                            AI команди
                        </Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-white font-medium">{library.title}</span>
                    </div>
                </motion.div>

                {/* Main Layout - Responsive based on screen size */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[calc(100vh-220px)]">
                    {/* Mobile: Dropdown Menu (< 1024px) */}
                    <div className="lg:hidden">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Изберете модул</label>
                            <select
                                value={selectedModuleId || ''}
                                onChange={(e) => setSelectedModuleId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-accent-yellow/30 text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-yellow/50 focus:border-accent-yellow/50 transition-all appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    backgroundSize: '20px',
                                }}
                            >
                                {library.modules.map((module) => (
                                    <option key={module.id} value={module.id} className="bg-gray-900 text-white">
                                        {module.icon ? `${module.icon} ` : ''}{module.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Desktop: Sidebar (≥ 1024px) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden lg:flex w-72 shrink-0 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex-col"
                    >
                        <div className="p-5 border-b border-white/10">
                            <h2 className="font-bold text-white text-lg">Модули</h2>
                            <p className="text-gray-500 text-sm mt-1">Изберете модул</p>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
                            {library.modules.map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => setSelectedModuleId(module.id)}
                                    className={clsx(
                                        'w-full text-left px-4 py-3 rounded-xl transition-all',
                                        selectedModuleId === module.id
                                            ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-yellow-hover/20 border border-accent-yellow/30'
                                            : 'hover:bg-white/5 border border-transparent'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {module.icon && (
                                            <span className="text-xl mt-0.5">{module.icon}</span>
                                        )}
                                        <div className="min-w-0">
                                            <div className={clsx(
                                                'font-medium text-sm',
                                                selectedModuleId === module.id ? 'text-white' : 'text-gray-300'
                                            )}>
                                                {module.title}
                                            </div>
                                            {module.subtitle && (
                                                <div className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {module.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Content Area - Now takes full remaining width */}
                    <motion.div
                        key={selectedModuleId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col"
                    >
                        {currentModule && (
                            <>
                                {/* Module Header */}
                                <div className="p-8 border-b border-white/10 bg-gradient-to-br from-accent-yellow/5 to-accent-yellow-hover/5">
                                    <div className="flex items-start gap-5">
                                        {currentModule.icon && (
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20 flex items-center justify-center shrink-0">
                                                <span className="text-4xl">{currentModule.icon}</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold text-white mb-2">
                                                {currentModule.title}
                                            </h2>
                                            {currentModule.subtitle && (
                                                <p className="text-accent-yellow font-medium text-lg">
                                                    {currentModule.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {currentModule.introduction && (
                                        <div className="mt-6 p-5 rounded-xl bg-black/20 border border-white/10">
                                            <MarkdownContent content={currentModule.introduction} />
                                        </div>
                                    )}
                                </div>

                                {/* Module Content */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    {/* Sections */}
                                    {currentModule.sections.length > 0 && (
                                        <div className="space-y-4">
                                            {currentModule.sections.map((section) => (
                                                <SectionCard key={section.id} section={section} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Categories with Prompts */}
                                    {currentModule.categories.length > 0 && (
                                        <div className="space-y-8">
                                            {currentModule.categories.map((category) => (
                                                <div key={category.id} className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20 flex items-center justify-center">
                                                            <span className="text-xl">📂</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white">
                                                                {category.title}
                                                            </h3>
                                                            {category.description && (
                                                                <p className="text-gray-400 text-sm">{category.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-4">
                                                        {category.prompts.map((prompt) => (
                                                            <PromptCard
                                                                key={prompt.id}
                                                                prompt={prompt}
                                                                onSelect={() => setSelectedPrompt(prompt)}
                                                                isFavorite={isFavorite(prompt.id)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Prompt Modal */}
            <AnimatePresence>
                {selectedPrompt && (
                    <PromptModal
                        prompt={selectedPrompt}
                        onClose={() => setSelectedPrompt(null)}
                        isFavorite={isFavorite(selectedPrompt.id)}
                        onToggleFavorite={handleToggleFavorite}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
