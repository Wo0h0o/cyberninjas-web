'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
    Save, ArrowLeft, Eye, EyeOff, Upload, X, Plus,
    GripVertical, Edit2, Trash2, PlayCircle, FileText
} from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Module {
    id: string
    title: string
    order_index: number
    lessons: Lesson[]
}

interface Lesson {
    id: string
    module_id: string
    title: string
    content: string | null
    video_url: string | null
    duration: number | null
    is_free: boolean
    order_index: number
}

export default function CourseEditorPage() {
    const router = useRouter()
    const params = useParams()
    const isNew = params.id === 'new'

    // Course metadata
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState(299)
    const [isPublished, setIsPublished] = useState(false)
    const [thumbnailUrl, setThumbnailUrl] = useState('')

    // Modules and lessons
    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        if (!isNew) {
            fetchCourse()
        }
    }, [params.id])

    // Auto-generate slug from title
    useEffect(() => {
        if (isNew && title) {
            const newSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            setSlug(newSlug)
        }
    }, [title, isNew])

    async function fetchCourse() {
        try {
            setLoading(true)
            const { data: course, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error) throw error

            setTitle(course.title)
            setSlug(course.slug)
            setDescription(course.description || '')
            setPrice(course.price_bgn)
            setIsPublished(course.is_published)
            setThumbnailUrl(course.thumbnail_url || '')

            // Fetch modules and lessons
            const { data: modulesData } = await supabase
                .from('modules')
                .select('*')
                .eq('course_id', params.id)
                .order('order_index')

            if (modulesData) {
                const modulesWithLessons = await Promise.all(
                    modulesData.map(async (module) => {
                        const { data: lessons } = await supabase
                            .from('lessons')
                            .select('*')
                            .eq('module_id', module.id)
                            .order('order_index')

                        return {
                            ...module,
                            lessons: lessons || [],
                        }
                    })
                )
                setModules(modulesWithLessons)
            }
        } catch (error) {
            console.error('Error fetching course:', error)
            alert('Грешка при зареждане на курса')
        } finally {
            setLoading(false)
        }
    }

    async function saveCourse() {
        if (!title.trim() || !slug.trim()) {
            alert('Моля попълни заглавие и slug')
            return
        }

        try {
            setSaving(true)

            if (isNew) {
                // Create new course
                const { data, error } = await supabase
                    .from('courses')
                    .insert({
                        title,
                        slug,
                        description: description || null,
                        price_bgn: price,
                        is_published: isPublished,
                        thumbnail_url: thumbnailUrl || null,
                    })
                    .select()
                    .single()

                if (error) throw error

                // Redirect to edit page
                router.push(`/dashboard/admin/courses/${data.id}`)
            } else {
                // Update existing course
                const { error } = await supabase
                    .from('courses')
                    .update({
                        title,
                        slug,
                        description: description || null,
                        price_bgn: price,
                        is_published: isPublished,
                        thumbnail_url: thumbnailUrl || null,
                    })
                    .eq('id', params.id)

                if (error) throw error

                alert('Курсът е запазен!')
            }
        } catch (error: any) {
            console.error('Error saving course:', error)
            alert(`Грешка: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    async function addModule() {
        if (isNew) {
            alert('Моля първо запази курса преди да добавяш модули')
            return
        }

        const newModule: Module = {
            id: `temp-${Date.now()}`,
            title: 'Нов модул',
            order_index: modules.length,
            lessons: [],
        }

        setModules([...modules, newModule])

        // Save to DB
        try {
            const { data, error } = await supabase
                .from('modules')
                .insert({
                    course_id: params.id,
                    title: newModule.title,
                    order_index: newModule.order_index,
                })
                .select()
                .single()

            if (error) throw error

            // Update with real ID
            setModules(modules.map(m =>
                m.id === newModule.id ? { ...m, id: data.id } : m
            ))
        } catch (error) {
            console.error('Error adding module:', error)
            alert('Грешка при добавяне на модул')
        }
    }

    async function updateModuleTitle(moduleId: string, newTitle: string) {
        setModules(modules.map(m =>
            m.id === moduleId ? { ...m, title: newTitle } : m
        ))

        try {
            const { error } = await supabase
                .from('modules')
                .update({ title: newTitle })
                .eq('id', moduleId)

            if (error) throw error
        } catch (error) {
            console.error('Error updating module:', error)
        }
    }

    async function deleteModule(moduleId: string) {
        if (!confirm('Сигурен ли си? Това ще изтрие всички лекции в модула!')) return

        try {
            const { error } = await supabase
                .from('modules')
                .delete()
                .eq('id', moduleId)

            if (error) throw error

            setModules(modules.filter(m => m.id !== moduleId))
        } catch (error) {
            console.error('Error deleting module:', error)
            alert('Грешка при изтриване на модул')
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setModules((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id)
                const newIndex = items.findIndex((i) => i.id === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)

                // Update order_index in DB
                newItems.forEach((item, index) => {
                    supabase
                        .from('modules')
                        .update({ order_index: index })
                        .eq('id', item.id)
                        .then()
                })

                return newItems
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400">Зареждане на курс...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/admin/courses')}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {isNew ? 'Създай курс' : 'Редактирай курс'}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {isNew ? 'Попълни детайлите на новия курс' : `Slug: ${slug}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPublished(!isPublished)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                            ${isPublished
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }
                        `}
                    >
                        {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {isPublished ? 'Публикуван' : 'Чернова'}
                    </button>
                    <button
                        onClick={saveCourse}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Запазване...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Запази
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Course Metadata */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                        <h2 className="font-semibold text-white">Основна информация</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Заглавие *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="AI Fundamentals"
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Slug *
                            </label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="ai-fundamentals"
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Описание
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Кратко описание на курса..."
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Цена (лв.)
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Thumbnail URL
                            </label>
                            <input
                                type="text"
                                value={thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                            />
                            {thumbnailUrl && (
                                <img src={thumbnailUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Modules & Lessons */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-white">Модули и лекции</h2>
                        <button
                            onClick={addModule}
                            disabled={isNew}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Добави модул
                        </button>
                    </div>

                    {isNew ? (
                        <div className="p-12 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                            <p className="text-gray-400 mb-2">Запази курса първо</p>
                            <p className="text-sm text-gray-500">След това ще можеш да добавяш модули и лекции</p>
                        </div>
                    ) : modules.length === 0 ? (
                        <div className="p-12 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                            <p className="text-gray-400 mb-2">Няма модули още</p>
                            <p className="text-sm text-gray-500">Кликни "Добави модул" за да започнеш</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={modules.map(m => m.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {modules.map((module) => (
                                        <ModuleCard
                                            key={module.id}
                                            module={module}
                                            onUpdateTitle={updateModuleTitle}
                                            onDelete={deleteModule}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    )
}

// Sortable Module Card Component
function ModuleCard({
    module,
    onUpdateTitle,
    onDelete,
}: {
    module: Module
    onUpdateTitle: (id: string, title: string) => void
    onDelete: (id: string) => void
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(module.title)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: module.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    function handleSave() {
        onUpdateTitle(module.id, title)
        setIsEditing(false)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3"
        >
            <div className="flex items-center gap-3">
                <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                    <GripVertical className="w-5 h-5" />
                </button>

                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                        className="flex-1 px-3 py-1 rounded bg-white/10 border border-purple-500/50 text-white focus:outline-none"
                    />
                ) : (
                    <h3 className="flex-1 font-medium text-white">{module.title}</h3>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(module.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Lessons list */}
            <div className="pl-8 space-y-2">
                {module.lessons.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">Няма лекции</div>
                ) : (
                    module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-2 text-sm">
                            {lesson.video_url ? (
                                <PlayCircle className="w-4 h-4 text-purple-400" />
                            ) : (
                                <FileText className="w-4 h-4 text-blue-400" />
                            )}
                            <span className="text-gray-300">{lesson.title}</span>
                            {lesson.is_free && (
                                <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-300">
                                    Free
                                </span>
                            )}
                        </div>
                    ))
                )}
                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Добави лекция
                </button>
            </div>
        </div>
    )
}
