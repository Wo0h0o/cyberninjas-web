'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import { ImageUpload } from '@/components/admin/ImageUpload'
import type { PromptLibrary } from '@/lib/types'

export default function LibrariesPage() {
    const [libraries, setLibraries] = useState<PromptLibrary[]>([])
    const [loading, setLoading] = useState(true)
    const [showNewForm, setShowNewForm] = useState(false)
    const [editingLibrary, setEditingLibrary] = useState<PromptLibrary | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        thumbnail_url: null as string | null,
        is_premium: false,
        is_published: false,
    })
    const [saving, setSaving] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Filter libraries by search query
    const filteredLibraries = libraries.filter(lib =>
        lib.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lib.description && lib.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Fetch libraries
    useEffect(() => {
        fetchLibraries()
    }, [])

    const fetchLibraries = async () => {
        try {
            const { data, error } = await supabase
                .from('prompt_libraries')
                .select('*')
                .order('order_index')

            if (error) throw error
            setLibraries(data || [])
        } catch (err) {
            console.error('Error fetching libraries:', err)
        } finally {
            setLoading(false)
        }
    }

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (editingLibrary) {
                // Update existing
                const { error } = await supabase
                    .from('prompt_libraries')
                    .update({
                        title: formData.title,
                        slug: formData.slug,
                        description: formData.description,
                        thumbnail_url: formData.thumbnail_url,
                        is_premium: formData.is_premium,
                        is_published: formData.is_published,
                    })
                    .eq('id', editingLibrary.id)

                if (error) throw error
            } else {
                // Create new
                const { error } = await supabase
                    .from('prompt_libraries')
                    .insert({
                        title: formData.title,
                        slug: formData.slug,
                        description: formData.description,
                        thumbnail_url: formData.thumbnail_url,
                        is_premium: formData.is_premium,
                        is_published: formData.is_published,
                        order_index: libraries.length,
                    })

                if (error) throw error
            }

            // Reset and refresh
            setShowNewForm(false)
            setEditingLibrary(null)
            setFormData({ title: '', slug: '', description: '', thumbnail_url: null, is_premium: false, is_published: false })
            fetchLibraries()
        } catch (err) {
            console.error('Error saving library:', err)
            alert('Грешка при запазване')
        } finally {
            setSaving(false)
        }
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('prompt_libraries')
                .delete()
                .eq('id', id)

            if (error) throw error
            setDeleteConfirm(null)
            fetchLibraries()
        } catch (err) {
            console.error('Error deleting library:', err)
            alert('Грешка при изтриване')
        }
    }

    const startEdit = (library: PromptLibrary) => {
        setEditingLibrary(library)
        setFormData({
            title: library.title,
            slug: library.slug,
            description: library.description || '',
            thumbnail_url: library.thumbnail_url,
            is_premium: library.is_premium,
            is_published: library.is_published,
        })
        setShowNewForm(true)
    }

    // Auto-generate slug
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white shrink-0">Библиотеки с промптове</h2>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Търси библиотеки..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingLibrary(null)
                        setFormData({ title: '', slug: '', description: '', thumbnail_url: null, is_premium: false, is_published: false })
                        setShowNewForm(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-opacity shrink-0"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Нова библиотека
                </button>
            </div>

            {/* New/Edit Form */}
            <AnimatePresence>
                {showNewForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4"
                    >
                        <h3 className="text-lg font-semibold text-white">
                            {editingLibrary ? 'Редактирай библиотека' : 'Нова библиотека'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Заглавие</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                            slug: editingLibrary ? formData.slug : generateSlug(e.target.value)
                                        })
                                    }}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    placeholder="DNA Protocol"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                                    placeholder="dna-protocol"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Описание</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                                rows={3}
                                placeholder="Кратко описание на библиотеката..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Изображение</label>
                            <ImageUpload
                                value={formData.thumbnail_url}
                                onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                                folder="libraries"
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_premium}
                                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                                />
                                <span className="text-gray-300">Premium съдържание</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                                />
                                <span className="text-gray-300">Публикувана</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {saving ? 'Запазване...' : (editingLibrary ? 'Запази промените' : 'Създай')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewForm(false)
                                    setEditingLibrary(null)
                                }}
                                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
                            >
                                Отказ
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Libraries List */}
            <div className="space-y-3">
                {filteredLibraries.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        {searchQuery ? `Няма резултати за "${searchQuery}"` : 'Няма библиотеки. Създайте първата!'}
                    </div>
                ) : (
                    filteredLibraries.map((library) => (
                        <motion.div
                            key={library.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 flex items-center justify-center">
                                    <span className="text-xl">📚</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">{library.title}</h3>
                                        {library.is_premium && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                                                PRO
                                            </span>
                                        )}
                                        <span className={clsx(
                                            'px-2 py-0.5 rounded-full text-xs font-medium',
                                            library.is_published
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                        )}>
                                            {library.is_published ? 'Публикувана' : 'Чернова'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">/prompts/{library.slug}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/dashboard/admin/libraries/${library.id}`}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    title="Модули и промптове"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </Link>
                                <button
                                    onClick={() => startEdit(library)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    title="Редактирай"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(library.id)}
                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                    title="Изтрий"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-md w-full"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Изтриване на библиотека</h3>
                            <p className="text-gray-400 mb-6">
                                Сигурни ли сте, че искате да изтриете тази библиотека? Това ще изтрие и всички модули и промптове в нея.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                                >
                                    Изтрий
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20 transition-colors"
                                >
                                    Отказ
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
