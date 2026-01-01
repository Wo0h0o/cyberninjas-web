'use client'
// @ts-nocheck - Supabase types not fully configured, will fix after deployment

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import { TagInput } from '@/components/admin/TagInput'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import type { PromptLibrary, LibraryModule, PromptCategory, Prompt, ModuleSection } from '@/lib/types'

interface LibraryDetailPageProps {
    params: Promise<{ id: string }>
}

export default function LibraryDetailPage({ params }: LibraryDetailPageProps) {
    const resolvedParams = use(params)
    const [library, setLibrary] = useState<PromptLibrary | null>(null)
    const [modules, setModules] = useState<LibraryModule[]>([])
    const [loading, setLoading] = useState(true)

    // Module form state
    const [showModuleForm, setShowModuleForm] = useState(false)
    const [editingModule, setEditingModule] = useState<LibraryModule | null>(null)
    const [moduleFormData, setModuleFormData] = useState({
        title: '',
        subtitle: '',
        icon: '📦',
        introduction: '',
    })
    const [savingModule, setSavingModule] = useState(false)
    const [deleteModuleConfirm, setDeleteModuleConfirm] = useState<string | null>(null)

    // Selected module for viewing categories/prompts
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
    const [categories, setCategories] = useState<(PromptCategory & { prompts: Prompt[] })[]>([])
    const [loadingCategories, setLoadingCategories] = useState(false)

    // Prompt form state
    const [showPromptForm, setShowPromptForm] = useState(false)
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [promptFormData, setPromptFormData] = useState({
        title: '',
        prompt_text: '',
        description: '',
        usage_tips: '',
        expected_result: '',
        tags: [] as string[],
        is_premium: false,
    })
    const [savingPrompt, setSavingPrompt] = useState(false)
    const [deletePromptConfirm, setDeletePromptConfirm] = useState<string | null>(null)

    // All tags for autocomplete
    const [allTags, setAllTags] = useState<string[]>([])

    // Category form state
    const [showCategoryForm, setShowCategoryForm] = useState(false)
    const [categoryFormData, setCategoryFormData] = useState({
        title: '',
        description: '',
    })
    const [savingCategory, setSavingCategory] = useState(false)

    // Sections state
    const [sections, setSections] = useState<ModuleSection[]>([])
    const [loadingSections, setLoadingSections] = useState(false)
    const [showSectionForm, setShowSectionForm] = useState(false)
    const [editingSection, setEditingSection] = useState<ModuleSection | null>(null)
    const [sectionFormData, setSectionFormData] = useState({
        title: '',
        content: '',
        section_type: 'narrative' as 'narrative' | 'instructions' | 'example' | 'warning',
    })
    const [savingSection, setSavingSection] = useState(false)
    const [deleteSectionConfirm, setDeleteSectionConfirm] = useState<string | null>(null)

    // Tab state for content vs prompts
    const [activeTab, setActiveTab] = useState<'sections' | 'prompts'>('sections')

    // Common emoji picker options
    const emojiOptions = ['📦', '🔧', '💡', '📚', '🎯', '⚡', '🚀', '💎', '🔥', '✨', '🎨', '📝']

    const sectionTypeOptions = [
        { value: 'narrative', label: '📖 Наратив', color: 'text-blue-400' },
        { value: 'instructions', label: '📋 Инструкции', color: 'text-green-400' },
        { value: 'example', label: '💡 Пример', color: 'text-amber-400' },
        { value: 'warning', label: '⚠️ Внимание', color: 'text-red-400' },
    ]

    // Fetch library, modules, and all tags
    useEffect(() => {
        fetchLibrary()
        fetchModules()
        fetchAllTags()
    }, [resolvedParams.id])

    // Fetch all unique tags for autocomplete
    const fetchAllTags = async () => {
        try {
            const { data, error } = await supabase
                .from('prompts')
                .select('tags')

            if (error) throw error

            // Extract unique tags from all prompts
            const tagsSet = new Set<string>()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ; (data as any[] | null)?.forEach((prompt: { tags?: string[] }) => {
                    if (prompt.tags && Array.isArray(prompt.tags)) {
                        prompt.tags.forEach((tag: string) => tagsSet.add(tag))
                    }
                })
            setAllTags(Array.from(tagsSet).sort())
        } catch (err) {
            console.error('Error fetching tags:', err)
        }
    }

    // Fetch categories and sections when module selected
    useEffect(() => {
        if (selectedModuleId) {
            fetchCategories(selectedModuleId)
            fetchSections(selectedModuleId)
        }
    }, [selectedModuleId])

    const fetchLibrary = async () => {
        try {
            const { data, error } = await supabase
                .from('prompt_libraries')
                .select('*')
                .eq('id', resolvedParams.id)
                .single()

            if (error) throw error
            setLibrary(data)
        } catch (err) {
            console.error('Error fetching library:', err)
        }
    }

    const fetchModules = async () => {
        try {
            const { data, error } = await supabase
                .from('library_modules')
                .select('*')
                .eq('library_id', resolvedParams.id)
                .order('order_index')

            if (error) throw error
            setModules(data || [])
            if (data && data.length > 0 && !selectedModuleId) {
                setSelectedModuleId(data[0].id)
            }
        } catch (err) {
            console.error('Error fetching modules:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async (moduleId: string) => {
        setLoadingCategories(true)
        try {
            const { data: categoriesData, error: catError } = await supabase
                .from('prompt_categories')
                .select('*')
                .eq('module_id', moduleId)
                .order('order_index')

            if (catError) throw catError

            // Fetch prompts for each category
            const categoriesWithPrompts = await Promise.all(
                (categoriesData || []).map(async (cat) => {
                    const { data: promptsData } = await supabase
                        .from('prompts')
                        .select('*')
                        .eq('category_id', cat.id)
                        .order('order_index')
                    return { ...cat, prompts: promptsData || [] }
                })
            )

            setCategories(categoriesWithPrompts)
        } catch (err) {
            console.error('Error fetching categories:', err)
        } finally {
            setLoadingCategories(false)
        }
    }

    const fetchSections = async (moduleId: string) => {
        setLoadingSections(true)
        try {
            const { data, error } = await supabase
                .from('module_sections')
                .select('*')
                .eq('module_id', moduleId)
                .order('order_index')

            if (error) throw error
            setSections(data || [])
        } catch (err) {
            console.error('Error fetching sections:', err)
        } finally {
            setLoadingSections(false)
        }
    }

    // Section CRUD
    const handleSectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedModuleId) return
        setSavingSection(true)

        try {
            if (editingSection) {
                const { error } = await supabase
                    .from('module_sections')
                    .update({
                        title: sectionFormData.title || null,
                        content: sectionFormData.content,
                        section_type: sectionFormData.section_type,
                    })
                    .eq('id', editingSection.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('module_sections')
                    .insert({
                        module_id: selectedModuleId,
                        title: sectionFormData.title || null,
                        content: sectionFormData.content,
                        section_type: sectionFormData.section_type,
                        order_index: sections.length,
                    })

                if (error) throw error
            }

            setShowSectionForm(false)
            setEditingSection(null)
            setSectionFormData({ title: '', content: '', section_type: 'narrative' })
            fetchSections(selectedModuleId)
        } catch (err) {
            console.error('Error saving section:', err)
            alert('Грешка при запазване')
        } finally {
            setSavingSection(false)
        }
    }

    const handleDeleteSection = async (id: string) => {
        try {
            const { error } = await supabase
                .from('module_sections')
                .delete()
                .eq('id', id)

            if (error) throw error
            setDeleteSectionConfirm(null)
            if (selectedModuleId) fetchSections(selectedModuleId)
        } catch (err) {
            console.error('Error deleting section:', err)
            alert('Грешка при изтриване')
        }
    }

    const startEditSection = (section: ModuleSection) => {
        setEditingSection(section)
        setSectionFormData({
            title: section.title || '',
            content: section.content,
            section_type: section.section_type,
        })
        setShowSectionForm(true)
    }

    // Module CRUD
    const handleModuleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingModule(true)

        try {
            if (editingModule) {
                const { error } = await supabase
                    .from('library_modules')
                    .update({
                        title: moduleFormData.title,
                        subtitle: moduleFormData.subtitle,
                        icon: moduleFormData.icon,
                        introduction: moduleFormData.introduction,
                    })
                    .eq('id', editingModule.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('library_modules')
                    .insert({
                        library_id: resolvedParams.id,
                        title: moduleFormData.title,
                        subtitle: moduleFormData.subtitle,
                        icon: moduleFormData.icon,
                        introduction: moduleFormData.introduction,
                        order_index: modules.length,
                    })

                if (error) throw error
            }

            setShowModuleForm(false)
            setEditingModule(null)
            setModuleFormData({ title: '', subtitle: '', icon: '📦', introduction: '' })
            fetchModules()
        } catch (err) {
            console.error('Error saving module:', err)
            alert('Грешка при запазване')
        } finally {
            setSavingModule(false)
        }
    }

    const handleDeleteModule = async (id: string) => {
        try {
            const { error } = await supabase
                .from('library_modules')
                .delete()
                .eq('id', id)

            if (error) throw error
            setDeleteModuleConfirm(null)
            if (selectedModuleId === id) {
                setSelectedModuleId(modules.find(m => m.id !== id)?.id || null)
            }
            fetchModules()
        } catch (err) {
            console.error('Error deleting module:', err)
            alert('Грешка при изтриване')
        }
    }

    const startEditModule = (module: LibraryModule) => {
        setEditingModule(module)
        setModuleFormData({
            title: module.title,
            subtitle: module.subtitle || '',
            icon: module.icon || '📦',
            introduction: module.introduction || '',
        })
        setShowModuleForm(true)
    }

    // Category CRUD
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedModuleId) return
        setSavingCategory(true)

        try {
            const { error } = await supabase
                .from('prompt_categories')
                .insert({
                    module_id: selectedModuleId,
                    title: categoryFormData.title,
                    description: categoryFormData.description,
                    order_index: categories.length,
                })

            if (error) throw error

            setShowCategoryForm(false)
            setCategoryFormData({ title: '', description: '' })
            fetchCategories(selectedModuleId)
        } catch (err) {
            console.error('Error saving category:', err)
            alert('Грешка при запазване')
        } finally {
            setSavingCategory(false)
        }
    }

    // Prompt CRUD
    const handlePromptSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategoryId) return
        setSavingPrompt(true)

        try {
            const promptData = {
                title: promptFormData.title,
                prompt_text: promptFormData.prompt_text,
                description: promptFormData.description,
                usage_tips: promptFormData.usage_tips,
                expected_result: promptFormData.expected_result,
                tags: promptFormData.tags,
                is_premium: promptFormData.is_premium,
            }

            if (editingPrompt) {
                const { error } = await supabase
                    .from('prompts')
                    .update(promptData)
                    .eq('id', editingPrompt.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('prompts')
                    .insert({
                        ...promptData,
                        category_id: selectedCategoryId,
                        order_index: categories.find(c => c.id === selectedCategoryId)?.prompts.length || 0,
                    })

                if (error) throw error
            }

            setShowPromptForm(false)
            setEditingPrompt(null)
            setSelectedCategoryId(null)
            setPromptFormData({ title: '', prompt_text: '', description: '', usage_tips: '', expected_result: '', tags: [], is_premium: false })
            fetchAllTags() // Refresh tags list
            if (selectedModuleId) fetchCategories(selectedModuleId)
        } catch (err) {
            console.error('Error saving prompt:', err)
            alert('Грешка при запазване')
        } finally {
            setSavingPrompt(false)
        }
    }

    const handleDeletePrompt = async (id: string) => {
        try {
            const { error } = await supabase
                .from('prompts')
                .delete()
                .eq('id', id)

            if (error) throw error
            setDeletePromptConfirm(null)
            if (selectedModuleId) fetchCategories(selectedModuleId)
        } catch (err) {
            console.error('Error deleting prompt:', err)
            alert('Грешка при изтриване')
        }
    }

    const startEditPrompt = (prompt: Prompt, categoryId: string) => {
        setEditingPrompt(prompt)
        setSelectedCategoryId(categoryId)
        setPromptFormData({
            title: prompt.title,
            prompt_text: prompt.prompt_text,
            description: prompt.description || '',
            usage_tips: prompt.usage_tips || '',
            expected_result: prompt.expected_result || '',
            tags: prompt.tags || [],
            is_premium: prompt.is_premium,
        })
        setShowPromptForm(true)
    }

    const startAddPrompt = (categoryId: string) => {
        setEditingPrompt(null)
        setSelectedCategoryId(categoryId)
        setPromptFormData({ title: '', prompt_text: '', description: '', usage_tips: '', expected_result: '', tags: [], is_premium: false })
        setShowPromptForm(true)
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-12 w-48 bg-white/[0.03] rounded-lg animate-pulse" />
                <div className="h-64 bg-white/[0.03] rounded-xl animate-pulse" />
            </div>
        )
    }

    if (!library) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Библиотеката не е намерена</p>
                <Link href="/dashboard/admin/libraries" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
                    ← Обратно към библиотеките
                </Link>
            </div>
        )
    }

    const selectedModule = modules.find(m => m.id === selectedModuleId)

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/dashboard/admin/libraries" className="text-gray-400 hover:text-white">
                    Библиотеки
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-white font-medium">{library.title}</span>
            </div>

            {/* Main Layout */}
            <div className="flex gap-6 min-h-[600px]">
                {/* Modules Sidebar */}
                <div className="w-72 shrink-0 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Модули</h3>
                        <button
                            onClick={() => {
                                setEditingModule(null)
                                setModuleFormData({ title: '', subtitle: '', icon: '📦', introduction: '' })
                                setShowModuleForm(true)
                            }}
                            className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                            title="Добави модул"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {modules.length === 0 ? (
                            <p className="text-gray-500 text-sm py-4 text-center">Няма модули</p>
                        ) : (
                            modules.map((module) => (
                                <div
                                    key={module.id}
                                    className={clsx(
                                        'p-3 rounded-xl border transition-all cursor-pointer group',
                                        selectedModuleId === module.id
                                            ? 'bg-purple-500/20 border-purple-500/30'
                                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                    )}
                                    onClick={() => setSelectedModuleId(module.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{module.icon}</span>
                                            <div>
                                                <p className="font-medium text-white text-sm">{module.title}</p>
                                                {module.subtitle && (
                                                    <p className="text-xs text-gray-500 truncate max-w-[140px]">{module.subtitle}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEditModule(module) }}
                                                className="p-1 rounded hover:bg-white/10 text-gray-400"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteModuleConfirm(module.id) }}
                                                className="p-1 rounded hover:bg-red-500/20 text-red-400"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/10 p-6 overflow-y-auto">
                    {selectedModule ? (
                        <div className="space-y-6">
                            {/* Module Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{selectedModule.icon}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedModule.title}</h2>
                                        {selectedModule.subtitle && (
                                            <p className="text-gray-400 text-sm">{selectedModule.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 p-1 rounded-xl bg-white/[0.02] border border-white/10">
                                <button
                                    onClick={() => setActiveTab('sections')}
                                    className={clsx(
                                        'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
                                        activeTab === 'sections'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    📖 Съдържание ({sections.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('prompts')}
                                    className={clsx(
                                        'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
                                        activeTab === 'prompts'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    📝 Промптове ({categories.reduce((acc, c) => acc + c.prompts.length, 0)})
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'sections' ? (
                                <div className="space-y-4">
                                    {/* Add Section Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => {
                                                setEditingSection(null)
                                                setSectionFormData({ title: '', content: '', section_type: 'narrative' })
                                                setShowSectionForm(true)
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                            Добави секция
                                        </button>
                                    </div>

                                    {/* Sections List */}
                                    {loadingSections ? (
                                        <div className="space-y-4">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="h-24 bg-white/[0.02] rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : sections.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <p>Няма секции в този модул</p>
                                            <p className="text-sm mt-1">Секциите са теоретичното съдържание (наративи, инструкции, примери)</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sections.map((section) => {
                                                const typeOption = sectionTypeOptions.find(t => t.value === section.section_type)
                                                return (
                                                    <div
                                                        key={section.id}
                                                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors group"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', {
                                                                        'bg-blue-500/20 text-blue-400': section.section_type === 'narrative',
                                                                        'bg-green-500/20 text-green-400': section.section_type === 'instructions',
                                                                        'bg-amber-500/20 text-amber-400': section.section_type === 'example',
                                                                        'bg-red-500/20 text-red-400': section.section_type === 'warning',
                                                                    })}>
                                                                        {typeOption?.label}
                                                                    </span>
                                                                    {section.title && (
                                                                        <h4 className="font-semibold text-white">{section.title}</h4>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-400 text-sm line-clamp-3 whitespace-pre-wrap">
                                                                    {section.content}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                <button
                                                                    onClick={() => startEditSection(section)}
                                                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteSectionConfirm(section.id)}
                                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                                                                >
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Add Category Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setShowCategoryForm(true)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                            Добави категория
                                        </button>
                                    </div>

                                    {/* Categories & Prompts */}
                                    {loadingCategories ? (
                                        <div className="space-y-4">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="h-32 bg-white/[0.02] rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : categories.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <p>Няма категории в този модул</p>
                                            <p className="text-sm mt-1">Добавете първата категория за да започнете</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {categories.map((category) => (
                                                <div key={category.id} className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden">
                                                    {/* Category Header */}
                                                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                                                        <div>
                                                            <h3 className="font-semibold text-white">{category.title}</h3>
                                                            {category.description && (
                                                                <p className="text-sm text-gray-400">{category.description}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => startAddPrompt(category.id)}
                                                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M12 5v14M5 12h14" />
                                                            </svg>
                                                            Промпт
                                                        </button>
                                                    </div>

                                                    {/* Prompts */}
                                                    <div className="p-2">
                                                        {category.prompts.length === 0 ? (
                                                            <p className="text-sm text-gray-500 p-3 text-center">Няма промптове</p>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                {category.prompts.map((prompt) => (
                                                                    <div
                                                                        key={prompt.id}
                                                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 group"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-gray-500">📝</span>
                                                                            <div>
                                                                                <p className="text-white text-sm font-medium">{prompt.title}</p>
                                                                                {prompt.description && (
                                                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{prompt.description}</p>
                                                                                )}
                                                                            </div>
                                                                            {prompt.is_premium && (
                                                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">PRO</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={() => startEditPrompt(prompt, category.id)}
                                                                                className="p-1 rounded hover:bg-white/10 text-gray-400"
                                                                            >
                                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setDeletePromptConfirm(prompt.id)}
                                                                                className="p-1 rounded hover:bg-red-500/20 text-red-400"
                                                                            >
                                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Изберете модул отляво
                        </div>
                    )}
                </div>
            </div>

            {/* Module Form Modal */}
            <AnimatePresence>
                {showModuleForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModuleForm(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handleModuleSubmit}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-lg w-full space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white">
                                {editingModule ? 'Редактирай модул' : 'Нов модул'}
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Икона</label>
                                <div className="flex gap-2 flex-wrap">
                                    {emojiOptions.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setModuleFormData({ ...moduleFormData, icon: emoji })}
                                            className={clsx(
                                                'w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all',
                                                moduleFormData.icon === emoji
                                                    ? 'bg-purple-500/30 border-2 border-purple-500'
                                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                            )}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Заглавие</label>
                                <input
                                    type="text"
                                    value={moduleFormData.title}
                                    onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="Модул 1: Въведение"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Подзаглавие</label>
                                <input
                                    type="text"
                                    value={moduleFormData.subtitle}
                                    onChange={(e) => setModuleFormData({ ...moduleFormData, subtitle: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="Кратко описание"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Въведение (markdown)</label>
                                <textarea
                                    value={moduleFormData.introduction}
                                    onChange={(e) => setModuleFormData({ ...moduleFormData, introduction: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none resize-none"
                                    rows={4}
                                    placeholder="Въведителен текст за модула..."
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={savingModule}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
                                >
                                    {savingModule ? 'Запазване...' : (editingModule ? 'Запази' : 'Създай')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModuleForm(false)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
                                >
                                    Отказ
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Form Modal */}
            <AnimatePresence>
                {showCategoryForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCategoryForm(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handleCategorySubmit}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-md w-full space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white">Нова категория</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Заглавие</label>
                                <input
                                    type="text"
                                    value={categoryFormData.title}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="Системни промптове"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Описание</label>
                                <textarea
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none resize-none"
                                    rows={2}
                                    placeholder="Описание на категорията..."
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={savingCategory}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
                                >
                                    {savingCategory ? 'Запазване...' : 'Създай'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryForm(false)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
                                >
                                    Отказ
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prompt Form Modal */}
            <AnimatePresence>
                {showPromptForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPromptForm(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handlePromptSubmit}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white">
                                {editingPrompt ? 'Редактирай промпт' : 'Нов промпт'}
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Заглавие</label>
                                <input
                                    type="text"
                                    value={promptFormData.title}
                                    onChange={(e) => setPromptFormData({ ...promptFormData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="The Strategist System Instructions"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Промпт текст</label>
                                <textarea
                                    value={promptFormData.prompt_text}
                                    onChange={(e) => setPromptFormData({ ...promptFormData, prompt_text: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
                                    rows={8}
                                    placeholder="### SYSTEM INSTRUCTIONS..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Описание</label>
                                <textarea
                                    value={promptFormData.description}
                                    onChange={(e) => setPromptFormData({ ...promptFormData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none resize-none"
                                    rows={2}
                                    placeholder="Кратко описание"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Как да използваш</label>
                                    <textarea
                                        value={promptFormData.usage_tips}
                                        onChange={(e) => setPromptFormData({ ...promptFormData, usage_tips: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Очакван резултат</label>
                                    <textarea
                                        value={promptFormData.expected_result}
                                        onChange={(e) => setPromptFormData({ ...promptFormData, expected_result: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Тагове</label>
                                <TagInput
                                    value={promptFormData.tags}
                                    onChange={(tags) => setPromptFormData({ ...promptFormData, tags })}
                                    suggestions={allTags}
                                    placeholder="Добави таг..."
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={promptFormData.is_premium}
                                    onChange={(e) => setPromptFormData({ ...promptFormData, is_premium: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500"
                                />
                                <span className="text-gray-300">Premium промпт</span>
                            </label>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={savingPrompt}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
                                >
                                    {savingPrompt ? 'Запазване...' : (editingPrompt ? 'Запази' : 'Създай')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPromptForm(false)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
                                >
                                    Отказ
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Module Confirmation */}
            <AnimatePresence>
                {deleteModuleConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteModuleConfirm(null)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-md w-full"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Изтриване на модул</h3>
                            <p className="text-gray-400 mb-6">
                                Това ще изтрие модула и всички категории и промптове в него.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDeleteModule(deleteModuleConfirm)}
                                    className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
                                >
                                    Изтрий
                                </button>
                                <button
                                    onClick={() => setDeleteModuleConfirm(null)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
                                >
                                    Отказ
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Prompt Confirmation */}
            <AnimatePresence>
                {deletePromptConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeletePromptConfirm(null)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-md w-full"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Изтриване на промпт</h3>
                            <p className="text-gray-400 mb-6">
                                Сигурни ли сте, че искате да изтриете този промпт?
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDeletePrompt(deletePromptConfirm)}
                                    className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
                                >
                                    Изтрий
                                </button>
                                <button
                                    onClick={() => setDeletePromptConfirm(null)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
                                >
                                    Отказ
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Section Form Modal */}
            <AnimatePresence>
                {showSectionForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSectionForm(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handleSectionSubmit}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white">
                                {editingSection ? 'Редактирай секция' : 'Нова секция'}
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Тип на секцията</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {sectionTypeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setSectionFormData({ ...sectionFormData, section_type: option.value as 'narrative' | 'instructions' | 'example' | 'warning' })}
                                            className={clsx(
                                                'px-4 py-3 rounded-xl border transition-all text-left',
                                                sectionFormData.section_type === option.value
                                                    ? 'bg-white/10 border-white/30'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                            )}
                                        >
                                            <span className={option.color}>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Заглавие (опционално)</label>
                                <input
                                    type="text"
                                    value={sectionFormData.title}
                                    onChange={(e) => setSectionFormData({ ...sectionFormData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="Фундаменталният недостатък на AI"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Съдържание</label>
                                <MarkdownEditor
                                    value={sectionFormData.content}
                                    onChange={(content) => setSectionFormData({ ...sectionFormData, content })}
                                    placeholder="Въведете текста на секцията..."
                                    rows={10}
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={savingSection}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
                                >
                                    {savingSection ? 'Запазване...' : (editingSection ? 'Запази' : 'Създай')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSectionForm(false)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
                                >
                                    Отказ
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Section Confirmation */}
            <AnimatePresence>
                {deleteSectionConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteSectionConfirm(null)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative p-6 rounded-2xl bg-gray-900 border border-white/10 max-w-md w-full"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Изтриване на секция</h3>
                            <p className="text-gray-400 mb-6">
                                Сигурни ли сте, че искате да изтриете тази секция?
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDeleteSection(deleteSectionConfirm)}
                                    className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600"
                                >
                                    Изтрий
                                </button>
                                <button
                                    onClick={() => setDeleteSectionConfirm(null)}
                                    className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 font-medium hover:bg-white/20"
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

