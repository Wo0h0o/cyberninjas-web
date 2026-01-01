'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/usePrompts'
import type { Prompt } from '@/lib/types'

// Prompt Modal Component (copied from [slug]/page.tsx for consistency)
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
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col"
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
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span>📋</span> Промпт за копиране
                        </h4>
                        <div className="p-5 rounded-2xl bg-black/50 border border-white/10 font-mono text-sm text-gray-200 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                            {prompt.prompt_text}
                        </div>
                    </div>

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

                {/* Actions */}
                <div className="p-6 md:p-8 border-t border-white/10 bg-black/30 flex items-center gap-4">
                    <button
                        onClick={copyPrompt}
                        className={clsx(
                            'flex-1 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3',
                            copied
                                ? 'bg-green-500 text-white'
                                : 'bg-gradient-to-r from-accent-yellow to-accent-yellow-hover text-white hover:opacity-90'
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

export default function FavoritesPage() {
    const { user } = useAuth()
    const { isFavorite, toggleFavorite } = useFavorites()
    const [favoritePrompts, setFavoritePrompts] = useState<Prompt[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

    // Fetch favorite prompts with full details
    useEffect(() => {
        const fetchFavoritePrompts = async () => {
            if (!user) {
                setFavoritePrompts([])
                setLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('user_favorites')
                    .select(`
                        prompt_id,
                        prompts (*)
                    `)
                    .eq('user_id', user.id)

                if (error) throw error

                const prompts = data
                    ?.map((f: { prompts: Prompt }) => f.prompts)
                    .filter(Boolean) || []

                setFavoritePrompts(prompts)
            } catch (err) {
                console.error('Error fetching favorite prompts:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchFavoritePrompts()
    }, [user])

    const handleToggleFavorite = async () => {
        if (!selectedPrompt) return
        await toggleFavorite(selectedPrompt.id)
        // Remove from local state if unfavorited
        setFavoritePrompts(prev => prev.filter(p => p.id !== selectedPrompt.id))
        setSelectedPrompt(null)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 bg-white/[0.03] rounded-lg animate-pulse" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Влезте в профила си</h2>
                <p className="text-gray-400 mb-6">За да видите любимите си промптове, моля влезте в профила си.</p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-yellow to-accent-yellow-hover text-white font-semibold hover:opacity-90 transition-opacity"
                >
                    Вход
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
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">❤️ Любими промптове</h1>
                        <p className="text-gray-400">
                            {favoritePrompts.length === 0
                                ? 'Все още нямате любими промптове'
                                : `${favoritePrompts.length} любим${favoritePrompts.length === 1 ? '' : 'и'} промпт${favoritePrompts.length === 1 ? '' : 'а'}`
                            }
                        </p>
                    </div>
                    <Link
                        href="/dashboard/prompts"
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        ← Към библиотеките
                    </Link>
                </motion.div>

                {/* Empty State */}
                {favoritePrompts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 rounded-2xl bg-white/[0.02] border border-white/10"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20 flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl">💜</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">Няма любими промптове</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">
                            Отидете в библиотеката с промптове и натиснете ❤️ на тези, които харесвате, за да ги запазите тук.
                        </p>
                        <Link
                            href="/dashboard/prompts"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-yellow to-accent-yellow-hover text-white font-semibold hover:opacity-90 transition-opacity"
                        >
                            <span>📚</span>
                            Разгледай промптовете
                        </Link>
                    </motion.div>
                )}

                {/* Favorites Grid */}
                {favoritePrompts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid gap-4"
                    >
                        {favoritePrompts.map((prompt, index) => (
                            <motion.button
                                key={prompt.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedPrompt(prompt)}
                                className="w-full text-left p-6 rounded-2xl border bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-accent-yellow/30 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20 flex items-center justify-center shrink-0 group-hover:from-purple-500/30 group-hover:to-fuchsia-500/30 transition-colors">
                                            <span className="text-2xl">📝</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white text-lg mb-1 group-hover:text-accent-yellow transition-colors">
                                                {prompt.title}
                                            </div>
                                            {prompt.description && (
                                                <div className="text-sm text-gray-400 line-clamp-2">
                                                    {prompt.description}
                                                </div>
                                            )}
                                            {prompt.tags && prompt.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {prompt.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 rounded-full bg-accent-yellow/10 text-accent-yellow text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {prompt.is_premium && (
                                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                                                PRO
                                            </span>
                                        )}
                                        <div className="text-red-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
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
