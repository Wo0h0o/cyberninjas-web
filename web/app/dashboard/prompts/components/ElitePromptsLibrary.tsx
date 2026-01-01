'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { clsx } from 'clsx'
import { getElitePrompts, type EliteLibraryData, type EliteModule, type ElitePrompt } from '@/app/actions/getElitePrompts'

// Markdown specific renderer for this component
function ContentRenderer({ content }: { content: string }) {
    if (!content) return null

    // Simple markdown processing
    const sections = content.split('\n')

    return (
        <div className="space-y-4 text-gray-300">
            {sections.map((line, i) => {
                const trimmed = line.trim()
                if (!trimmed) return <div key={i} className="h-2" />

                // Headers
                if (trimmed.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white mt-6 mb-4">{trimmed.replace(/^#\s+/, '')}</h1>
                if (trimmed.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-6 mb-4">{trimmed.replace(/^##\s+/, '')}</h2>
                if (trimmed.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-purple-300 mt-4 mb-2">{trimmed.replace(/^###\s+/, '')}</h3>

                // Bullet points
                if (trimmed.match(/^[\*\-]\s/)) {
                    return (
                        <div key={i} className="flex gap-3 pl-4">
                            <span className="text-purple-400 mt-1.5">•</span>
                            <span className="leading-relaxed" dangerouslySetInnerHTML={{
                                __html: trimmed.replace(/^[\*\-]\s/, '')
                                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-purple-200 text-sm">$1</code>')
                            }} />
                        </div>
                    )
                }

                // Numbered lists
                if (trimmed.match(/^\d+\.\s/)) {
                    const num = trimmed.match(/^(\d+)\./)?.[1]
                    const text = trimmed.replace(/^\d+\.\s/, '')
                    return (
                        <div key={i} className="flex gap-3 pl-4">
                            <span className="text-purple-400 font-bold min-w-[24px]">{num}.</span>
                            <span className="leading-relaxed" dangerouslySetInnerHTML={{
                                __html: text
                                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                                    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-purple-200 text-sm">$1</code>')
                            }} />
                        </div>
                    )
                }

                // Images
                if (trimmed.match(/!\[.*\]\(.*\)/)) {
                    const src = trimmed.match(/\((.*?)\)/)?.[1]
                    const alt = trimmed.match(/\[(.*?)\]/)?.[1]
                    if (src) return (
                        <div key={i} className="my-6 rounded-xl overflow-hidden border border-white/10">
                            <img src={src} alt={alt} className="w-full object-cover" />
                        </div>
                    )
                }

                // Blockquotes
                if (trimmed.startsWith('> ')) {
                    return (
                        <div key={i} className="pl-4 border-l-4 border-purple-500/50 italic text-gray-400 my-4">
                            {trimmed.replace(/^>\s+/, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
                        </div>
                    )
                }

                // Standard paragraph
                return (
                    <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{
                        __html: trimmed
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                            .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-purple-200 text-sm">$1</code>')
                    }} />
                )
            })}
        </div>
    )
}

function PromptCard({
    prompt,
    onSelect,
}: {
    prompt: ElitePrompt
    onSelect: () => void
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onSelect}
            className="w-full text-left p-5 rounded-2xl border bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-purple-500/30 transition-all group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0 group-hover:from-purple-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                        <span className="text-xl">📝</span>
                    </div>
                    <div>
                        <div className="font-semibold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">{prompt.title}</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5">
                                {prompt.difficulty}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/5">
                                ⏱️ {prompt.time}
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 line-clamp-2">
                            {prompt.description || "Кликнете за да видите детайли и използвате този промпт."}
                        </div>
                    </div>
                </div>
            </div>
        </motion.button>
    )
}

function PromptModal({
    prompt,
    onClose,
}: {
    prompt: ElitePrompt
    onClose: () => void
}) {
    const [copied, setCopied] = useState(false)

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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 shadow-2xl flex flex-col"
            >
                <div className="p-6 md:p-8 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">{prompt.title}</h2>
                            <p className="text-gray-400 mt-2">{prompt.description}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-xl">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span>📋</span> Промпт за копиране
                        </h4>
                        <div className="relative">
                            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 font-mono text-sm text-gray-200 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                                {prompt.prompt_text || "Няма наличен текст за този промпт."}
                            </div>
                        </div>
                    </div>
                    {prompt.tags && (
                        <div className="flex flex-wrap gap-2">
                            {prompt.tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-6 md:p-8 border-t border-white/10 bg-black/30 flex items-center gap-4">
                    <button
                        onClick={copyPrompt}
                        className={clsx(
                            'flex-1 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3',
                            copied ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:opacity-90'
                        )}
                    >
                        {copied ? 'Копирано!' : 'Копирай промпта'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function ElitePromptsLibrary() {
    const [data, setData] = useState<EliteLibraryData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedModuleId, setSelectedModuleId] = useState<string>("intro")
    const [selectedPrompt, setSelectedPrompt] = useState<ElitePrompt | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getElitePrompts()
                setData(result)
            } catch (error) {
                console.error("Failed to fetch elite prompts:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const currentModule = data?.modules.find(m => m.id === selectedModuleId)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (!data) {
        return <div className="text-center text-red-400 py-10">Неуспешно зареждане на библиотеката.</div>
    }

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 text-sm">
                    <Link href="/dashboard/prompts" className="text-gray-400 hover:text-white transition-colors">AI команди</Link>
                    <span className="text-gray-600">/</span>
                    <span className="text-white font-medium">{data.title}</span>
                </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-220px)]">
                {/* Sidebar */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-72 shrink-0 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col h-fit">
                    <div className="p-5 border-b border-white/10">
                        <h2 className="font-bold text-white text-lg">Модули</h2>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-3 space-y-2">
                        {/* Overview/Intro Button */}
                        <button
                            onClick={() => setSelectedModuleId("intro")}
                            className={clsx('w-full text-left px-4 py-3 rounded-xl transition-all', selectedModuleId === "intro" ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent')}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📖</span>
                                <div className={clsx('font-medium text-sm', selectedModuleId === "intro" ? 'text-white' : 'text-gray-300')}>Преглед</div>
                            </div>
                        </button>

                        {data.modules.map(module => (
                            <button
                                key={module.id}
                                onClick={() => setSelectedModuleId(module.id)}
                                className={clsx('w-full text-left px-4 py-3 rounded-xl transition-all', selectedModuleId === module.id ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent')}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl mt-0.5">{module.icon}</span>
                                    <div>
                                        <div className={clsx('font-medium text-sm', selectedModuleId === module.id ? 'text-white' : 'text-gray-300')}>{module.title}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </nav>
                </motion.div>

                {/* Main Content */}
                <motion.div key={selectedModuleId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col min-h-[600px]">
                    {selectedModuleId === "intro" ? (
                        <div className="p-8 md:p-12 overflow-y-auto">
                            <ContentRenderer content={data.intro} />
                        </div>
                    ) : currentModule ? (
                        <>
                            <div className="p-8 border-b border-white/10 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5">
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0">
                                        <span className="text-4xl">{currentModule.icon}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{currentModule.title}</h2>
                                        <p className="text-purple-400 font-medium text-lg">{currentModule.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                {currentModule.prompts.length > 0 ? (
                                    currentModule.prompts.map((prompt, idx) => (
                                        <PromptCard key={prompt.id || idx} prompt={prompt} onSelect={() => setSelectedPrompt(prompt)} />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-10">Няма намерени промптове в този модул.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-gray-400">Зареждане...</div>
                    )}
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedPrompt && <PromptModal prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />}
            </AnimatePresence>
        </div>
    )
}
