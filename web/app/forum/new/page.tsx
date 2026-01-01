'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { ForumCategory } from '@/lib/forum-types'
import styles from './NewTopic.module.css'

export default function NewTopicPage() {
    const router = useRouter()
    const { user, profile, session } = useAuth()
    const [categories, setCategories] = useState<ForumCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category_id: '',
        is_question: false,
        tags: ''
    })

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/forum/new')
        }
    }, [user, router])

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/forum/categories')
                const data = await res.json()
                if (data.categories) {
                    setCategories(data.categories)
                    if (data.categories.length > 0) {
                        setFormData(prev => ({ ...prev, category_id: data.categories[0].id }))
                    }
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const tags = formData.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0)

            // Build headers with auth token
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }

            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch('/api/forum/topics', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: formData.title,
                    content: formData.content,
                    category_id: formData.category_id,
                    is_question: formData.is_question,
                    tags
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Грешка при създаване на темата')
            }

            router.push(`/forum/topic/${data.topic.slug}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Нещо се обърка')
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return null
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/forum" className={styles.backLink}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Назад към форума
                </Link>
                <h1 className={styles.title}>Нова тема</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                    <div className={styles.error}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Category Select */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Категория</label>
                    <div className={styles.categoryGrid}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                className={`${styles.categoryOption} ${formData.category_id === cat.id ? styles.selected : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, category_id: cat.id }))}
                                style={{ '--cat-color': cat.color } as React.CSSProperties}
                            >
                                <span className={styles.catIcon}>{cat.icon}</span>
                                <span className={styles.catName}>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>Заглавие</label>
                    <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Въведи заглавие на темата..."
                        className={styles.input}
                        required
                        minLength={5}
                        maxLength={200}
                    />
                    <span className={styles.charCount}>{formData.title.length}/200</span>
                </div>

                {/* Content */}
                <div className={styles.formGroup}>
                    <label htmlFor="content" className={styles.label}>Съдържание</label>
                    <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Напиши съдържанието на темата... Поддържа Markdown форматиране."
                        className={styles.textarea}
                        required
                        minLength={20}
                        rows={12}
                    />
                    <div className={styles.textareaFooter}>
                        <span className={styles.hint}>Поддържа Markdown: **bold**, *italic*, `code`, [link](url)</span>
                    </div>
                </div>

                {/* Tags */}
                <div className={styles.formGroup}>
                    <label htmlFor="tags" className={styles.label}>
                        Тагове <span className={styles.optional}>(по избор)</span>
                    </label>
                    <input
                        id="tags"
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="AI, автоматизация, ChatGPT (разделени със запетая)"
                        className={styles.input}
                    />
                </div>

                {/* Options */}
                <div className={styles.options}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={formData.is_question}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_question: e.target.checked }))}
                        />
                        <span className={styles.checkmark} />
                        <span className={styles.checkboxLabel}>
                            <strong>Това е въпрос</strong>
                            <small>Позволява маркиране на отговор като решение</small>
                        </span>
                    </label>
                </div>

                {/* Submit */}
                <div className={styles.actions}>
                    <Link href="/forum" className={styles.cancelButton}>
                        Откажи
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !formData.title.trim() || !formData.content.trim()}
                        className={styles.submitButton}
                    >
                        {loading ? (
                            <>
                                <div className={styles.spinner} />
                                Публикуване...
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                </svg>
                                Публикувай
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
