'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { ForumTopic, ForumPost, ReactionType, TrustLevel } from '@/lib/forum-types'
import { TRUST_LEVEL_NAMES, TRUST_LEVEL_ICONS, REACTION_EMOJIS, calculateTrustLevel } from '@/lib/forum-types'
import { Sun, Moon, ArrowLeft, MoreVertical, Pin, Lock, Unlock, Trash2, PinOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './TopicDetail.module.css'

interface TopicPageProps {
    params: Promise<{ slug: string }>
}

interface TopicResponse {
    topic: ForumTopic & {
        reactions?: Array<{ type: ReactionType; count: number; hasReacted: boolean }>
    }
    posts: ForumPost[]
    permissions: {
        canReply: boolean
        canEdit: boolean
        canMarkSolution: boolean
        canEditWiki: boolean
        canModerate: boolean
    }
}

export default function TopicPage({ params }: TopicPageProps) {
    const { slug } = use(params)
    const { user, profile, session } = useAuth()
    const [data, setData] = useState<TopicResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [showModMenu, setShowModMenu] = useState(false)
    const [moderating, setModerating] = useState(false)
    const router = useRouter()

    // Use ref to track initial load - prevents React Strict Mode double execution
    const initialLoadDoneRef = useRef(false)
    const viewCountedRef = useRef(false)
    const authFetchDoneRef = useRef(false)

    // Fetch topic data - include auth if available for instant permissions
    useEffect(() => {
        if (initialLoadDoneRef.current) return
        initialLoadDoneRef.current = true

        async function fetchTopic() {
            try {
                setLoading(true)
                const skipView = viewCountedRef.current ? '?skipViewCount=true' : ''

                // Include auth token in initial request if available
                const headers: Record<string, string> = {}
                if (session?.access_token) {
                    headers['Authorization'] = `Bearer ${session.access_token}`
                    authFetchDoneRef.current = true // Mark auth fetch as done
                }

                const res = await fetch(`/api/forum/topics/${slug}${skipView}`, { headers })
                viewCountedRef.current = true

                if (!res.ok) {
                    throw new Error('Темата не беше намерена')
                }

                const topicData = await res.json()
                setData(topicData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Грешка при зареждане')
            } finally {
                setLoading(false)
            }
        }
        fetchTopic()
    }, [slug, session?.access_token])

    // Only refetch with auth if initial load was done without auth and session became available later
    useEffect(() => {
        // Skip if auth fetch was already done OR no session OR no data yet
        if (authFetchDoneRef.current || !session?.access_token || !data) return
        authFetchDoneRef.current = true

        async function refetchWithAuth() {
            try {
                const headers = { 'Authorization': `Bearer ${session!.access_token}` }
                const res = await fetch(`/api/forum/topics/${slug}?skipViewCount=true`, { headers })
                if (res.ok) {
                    const topicData = await res.json()
                    setData(topicData)
                }
            } catch {
                // Ignore auth refetch errors
            }
        }
        refetchWithAuth()
    }, [slug, session?.access_token, data])

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('forumTheme') as 'light' | 'dark' | null
        if (savedTheme) {
            setTheme(savedTheme)
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setTheme(prefersDark ? 'dark' : 'light')
        }
    }, [])

    // Toggle theme function
    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('forumTheme', newTheme)
    }, [theme])

    // Sync theme to parent layout wrapper
    useEffect(() => {
        const wrapper = document.querySelector('[class*="forumLayoutWrapper"]')
        if (wrapper) {
            wrapper.setAttribute('data-theme', theme)
        }
    }, [theme])

    // Submit reply
    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim() || submitting) return

        setSubmitting(true)
        try {
            // Build headers with auth token
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch('/api/forum/posts', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    topic_id: data?.topic.id,
                    content: replyContent.trim()
                })
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Грешка при публикуване')
            }

            // Add new post to list
            setData(prev => prev ? {
                ...prev,
                posts: [...prev.posts, result.post]
            } : null)

            setReplyContent('')
            setShowReplyForm(false)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Грешка')
        } finally {
            setSubmitting(false)
        }
    }

    // Mark solution
    const handleMarkSolution = async (postId: string) => {
        try {
            // Build headers with auth token
            const headers: Record<string, string> = {}
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch(`/api/forum/posts/${postId}/solution`, {
                method: 'POST',
                headers
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            // Refresh data with auth
            const refreshRes = await fetch(`/api/forum/topics/${slug}`, { headers })
            const refreshData = await refreshRes.json()
            setData(refreshData)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Грешка')
        }
    }

    // Moderation actions
    const handleModAction = async (action: 'pin' | 'unpin' | 'lock' | 'unlock' | 'delete') => {
        if (!session?.access_token || moderating) return
        setModerating(true)
        setShowModMenu(false)

        try {
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }

            if (action === 'delete') {
                if (!confirm('Сигурни ли сте, че искате да изтриете тази тема? Това действие е необратимо.')) {
                    setModerating(false)
                    return
                }

                const res = await fetch(`/api/forum/topics/${data?.topic.id}`, {
                    method: 'DELETE',
                    headers
                })

                if (!res.ok) {
                    const result = await res.json()
                    throw new Error(result.error || 'Грешка при изтриване')
                }

                // Redirect to forum after deletion
                router.push('/forum')
                return
            }

            // PATCH actions (pin, lock)
            const updates: Record<string, boolean> = {}
            if (action === 'pin') updates.is_pinned = true
            if (action === 'unpin') updates.is_pinned = false
            if (action === 'lock') updates.is_locked = true
            if (action === 'unlock') updates.is_locked = false

            const res = await fetch(`/api/forum/topics/${data?.topic.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updates)
            })

            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Грешка при обновяване')
            }

            // Refresh data
            const refreshRes = await fetch(`/api/forum/topics/${slug}?skipViewCount=true`, { headers })
            if (refreshRes.ok) {
                const refreshData = await refreshRes.json()
                setData(refreshData)
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Грешка')
        } finally {
            setModerating(false)
        }
    }

    // Delete post
    const handleDeletePost = async (postId: string) => {
        if (!session?.access_token) return

        if (!confirm('Сигурни ли сте, че искате да изтриете този коментар?')) {
            return
        }

        try {
            const res = await fetch(`/api/forum/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })

            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Грешка при изтриване')
            }

            // Remove post from local state
            setData(prev => prev ? {
                ...prev,
                posts: prev.posts.filter(p => p.id !== postId)
            } : null)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Грешка')
        }
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <p>Зареждане...</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>😕</div>
                <h2>Темата не беше намерена</h2>
                <p>{error}</p>
                <Link href="/forum" className={styles.backButton}>
                    Към форума
                </Link>
            </div>
        )
    }

    const { topic, posts, permissions } = data

    // Instant admin check from AuthContext - no need to wait for API
    const isAdmin = profile?.role === 'admin'
    // Merge API permissions with frontend admin check for instant UI
    const canModerate = permissions.canModerate || isAdmin

    return (
        <div className={styles.container} data-theme={theme}>
            {/* Header with Back Button, Breadcrumb and Theme Toggle */}
            <div className={styles.headerRow}>
                <Link href="/forum" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                    <span>Назад</span>
                </Link>
                <nav className={styles.breadcrumb}>
                    <Link href="/forum">Форум</Link>
                    <span className={styles.separator}>/</span>
                    {topic.category_name && (
                        <>
                            <Link href={`/forum?category=${topic.category_slug}`}>
                                {topic.category_icon} {topic.category_name}
                            </Link>
                            <span className={styles.separator}>/</span>
                        </>
                    )}
                    <span className={styles.current}>{topic.title.substring(0, 30)}...</span>
                </nav>
                <button
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Светъл режим' : 'Тъмен режим'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Two Column Layout */}
            <div className={styles.mainLayout}>
                {/* Main Content */}
                <main className={styles.mainContent}>
                    {/* Topic Header */}
                    <header className={styles.topicHeader}>
                        <div className={styles.topicBadges}>
                            {topic.is_solved && (
                                <span className={styles.solvedBadge}>✅ Решено</span>
                            )}
                            {topic.is_question && !topic.is_solved && (
                                <span className={styles.questionBadge}>❓ Въпрос</span>
                            )}
                            {topic.wiki_mode && (
                                <span className={styles.wikiBadge}>📝 Wiki</span>
                            )}
                            {topic.is_pinned && (
                                <span className={styles.pinnedBadge}>📌 Закачено</span>
                            )}
                            {topic.is_locked && (
                                <span className={styles.lockedBadge}>🔒 Заключено</span>
                            )}
                        </div>

                        <h1 className={styles.topicTitle}>{topic.title}</h1>

                        <div className={styles.topicMeta}>
                            <AuthorBadge
                                name={topic.author_name || 'Анонимен'}
                                avatar={topic.author_avatar}
                                level={topic.author_level || 1}
                                trustLevel={calculateTrustLevel(topic.author_level || 1)}
                            />
                            <span className={styles.metaSeparator}>·</span>
                            <time className={styles.timestamp}>
                                {formatDate(topic.created_at)}
                            </time>
                            <span className={styles.metaSeparator}>·</span>
                            <span className={styles.viewCount}>👁 {topic.views_count}</span>

                            {/* Moderation Menu */}
                            {canModerate && (
                                <div className={styles.modMenuWrapper}>
                                    <button
                                        className={styles.modMenuButton}
                                        onClick={() => setShowModMenu(!showModMenu)}
                                        disabled={moderating}
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {showModMenu && (
                                        <div className={styles.modDropdown}>
                                            <button onClick={() => handleModAction(topic.is_pinned ? 'unpin' : 'pin')}>
                                                {topic.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                                                {topic.is_pinned ? 'Откачи' : 'Закачи'}
                                            </button>
                                            <button onClick={() => handleModAction(topic.is_locked ? 'unlock' : 'lock')}>
                                                {topic.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                                                {topic.is_locked ? 'Отключи' : 'Заключи'}
                                            </button>
                                            <button className={styles.dangerAction} onClick={() => handleModAction('delete')}>
                                                <Trash2 size={16} />
                                                Изтрий темата
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </header>

                    {/* First Post (Topic Content) */}
                    <article className={styles.firstPost}>
                        <div className={styles.postContent}>
                            <MarkdownContent content={topic.content} />
                        </div>

                        <div className={styles.postFooter}>
                            <ReactionBar
                                reactions={topic.reactions || []}
                                targetType="topic"
                                targetId={topic.id}
                                canReact={!!user}
                                accessToken={session?.access_token}
                            />
                        </div>
                    </article>

                    {/* Solution Banner */}
                    {topic.is_solved && posts.some(p => p.is_solution) && (
                        <div className={styles.solutionBanner}>
                            <div className={styles.solutionHeader}>
                                <span className={styles.solutionIcon}>✅</span>
                                <span>Приет отговор</span>
                            </div>
                            {posts.filter(p => p.is_solution).map(post => (
                                <div key={post.id} className={styles.solutionContent}>
                                    <MarkdownContent content={post.content.substring(0, 300)} />
                                    {post.content.length > 300 && (
                                        <a href={`#post-${post.id}`} className={styles.solutionLink}>
                                            Виж целия отговор →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Posts / Replies */}
                    {posts.length > 0 && (
                        <section className={styles.postsSection}>
                            <h2 className={styles.postsTitle}>
                                💬 {posts.length} {posts.length === 1 ? 'отговор' : 'отговора'}
                            </h2>

                            <div className={styles.postsList}>
                                {posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        canMarkSolution={permissions.canMarkSolution && !topic.is_solved}
                                        onMarkSolution={() => handleMarkSolution(post.id)}
                                        canModerate={canModerate}
                                        onDeletePost={() => handleDeletePost(post.id)}
                                        accessToken={session?.access_token}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Reply Form - Show immediately for logged-in users */}
                    {user && !topic.is_locked ? (
                        <section className={styles.replySection}>
                            {showReplyForm ? (
                                <form onSubmit={handleSubmitReply} className={styles.replyForm}>
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Напиши отговор... Поддържа @споменавания и Markdown"
                                        className={styles.replyTextarea}
                                        rows={6}
                                        required
                                        minLength={10}
                                    />
                                    <div className={styles.replyActions}>
                                        <button
                                            type="button"
                                            className={styles.cancelButton}
                                            onClick={() => setShowReplyForm(false)}
                                        >
                                            Откажи
                                        </button>
                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={submitting || replyContent.length < 10}
                                        >
                                            {submitting ? 'Публикуване...' : 'Публикувай отговор'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    className={styles.showReplyButton}
                                    onClick={() => setShowReplyForm(true)}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Напиши отговор
                                </button>
                            )}
                        </section>
                    ) : topic.is_locked ? (
                        <div className={styles.lockedMessage}>
                            🔒 Тази тема е заключена и не приема нови отговори.
                        </div>
                    ) : !user ? (
                        <div className={styles.loginPrompt}>
                            <p>Искаш да отговориш?</p>
                            <Link href={`/login?redirect=/forum/topic/${slug}`} className={styles.loginButton}>
                                Влез в платформата
                            </Link>
                        </div>
                    ) : null}
                </main>

                {/* Right Sidebar */}
                <aside className={styles.sidebar}>
                    {/* Author Card */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>👤 Автор</h3>
                        <div className={styles.authorCard}>
                            <div className={styles.authorCardAvatar}>
                                {topic.author_avatar ? (
                                    <img src={topic.author_avatar} alt={topic.author_name || ''} />
                                ) : (
                                    <span>{(topic.author_name || 'A').charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className={styles.authorCardInfo}>
                                <span className={styles.authorCardName}>{topic.author_name || 'Анонимен'}</span>
                                <span className={styles.authorCardLevel}>
                                    {TRUST_LEVEL_ICONS[calculateTrustLevel(topic.author_level || 1)]} Ниво {topic.author_level || 1}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Topic Stats */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>📊 Статистика</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{topic.views_count}</span>
                                <span className={styles.statLabel}>Гледания</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{posts.length}</span>
                                <span className={styles.statLabel}>Отговора</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{formatDate(topic.created_at)}</span>
                                <span className={styles.statLabel}>Създадена</span>
                            </div>
                            {topic.last_activity_at && (
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{formatDate(topic.last_activity_at)}</span>
                                    <span className={styles.statLabel}>Последна активност</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>🏷️ Тагове</h3>
                            <div className={styles.tagsList}>
                                {(topic.tags as Array<{ id?: string; name: string; color?: string } | string>).map((tag, idx) => {
                                    const tagName = typeof tag === 'string' ? tag : tag.name
                                    const tagId = typeof tag === 'string' ? tag : (tag.id || tag.name)
                                    const tagColor = typeof tag === 'string' ? '#8B5CF6' : (tag.color || '#8B5CF6')
                                    return (
                                        <Link
                                            key={tagId || idx}
                                            href={`/forum?tag=${tagName}`}
                                            className={styles.tagPill}
                                            style={{ borderColor: tagColor }}
                                        >
                                            #{tagName}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>🔗 Бързи връзки</h3>
                        <div className={styles.quickLinks}>
                            <Link href="/forum">← Назад към форума</Link>
                            {topic.category_slug && (
                                <Link href={`/forum?category=${topic.category_slug}`}>
                                    {topic.category_icon} Всички теми в {topic.category_name}
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

// Author Badge Component
function AuthorBadge({
    name,
    avatar,
    level,
    trustLevel
}: {
    name: string
    avatar?: string | null
    level: number
    trustLevel: TrustLevel
}) {
    return (
        <div className={styles.authorBadge}>
            <div className={styles.avatar}>
                {avatar ? (
                    <img src={avatar} alt={name} />
                ) : (
                    <span>{name.charAt(0)}</span>
                )}
            </div>
            <span className={styles.authorName}>{name}</span>
            <span className={styles.trustBadge} title={TRUST_LEVEL_NAMES[trustLevel]}>
                {TRUST_LEVEL_ICONS[trustLevel]} Lvl {level}
            </span>
        </div>
    )
}

// Post Card Component
function PostCard({
    post,
    canMarkSolution,
    onMarkSolution,
    canModerate,
    onDeletePost,
    accessToken
}: {
    post: ForumPost
    canMarkSolution: boolean
    onMarkSolution: () => void
    canModerate?: boolean
    onDeletePost?: () => void
    accessToken?: string | null
}) {
    const trustLevel = calculateTrustLevel(post.author_level || 1)

    return (
        <article
            id={`post-${post.id}`}
            className={`${styles.postCard} ${post.is_solution ? styles.solutionPost : ''}`}
        >
            {post.is_solution && (
                <div className={styles.solutionLabel}>
                    ✅ Приет отговор
                </div>
            )}

            <div className={styles.postHeader}>
                <AuthorBadge
                    name={post.author_name || 'Анонимен'}
                    avatar={post.author_avatar}
                    level={post.author_level || 1}
                    trustLevel={trustLevel}
                />
                <time className={styles.postTime}>
                    {formatDate(post.created_at)}
                </time>
            </div>

            <div className={styles.postContent}>
                <MarkdownContent content={post.content} />
            </div>

            <div className={styles.postFooter}>
                <ReactionBar
                    reactions={post.reactions || []}
                    targetType="post"
                    targetId={post.id}
                    canReact={!!accessToken}
                    accessToken={accessToken}
                />

                {canMarkSolution && !post.is_solution && (
                    <button
                        className={styles.markSolutionButton}
                        onClick={onMarkSolution}
                    >
                        ✅ Маркирай като решение
                    </button>
                )}

                {canModerate && onDeletePost && (
                    <button
                        className={styles.deletePostBtn}
                        onClick={onDeletePost}
                    >
                        <Trash2 size={14} />
                        Изтрий
                    </button>
                )}
            </div>
        </article>
    )
}

// Reaction Bar Component
function ReactionBar({
    reactions,
    targetType,
    targetId,
    canReact,
    accessToken
}: {
    reactions: Array<{ type: ReactionType; count: number; hasReacted: boolean }>
    targetType: 'topic' | 'post'
    targetId: string
    canReact: boolean
    accessToken?: string | null
}) {
    const [showPicker, setShowPicker] = useState(false)
    const [localReactions, setLocalReactions] = useState(reactions)

    const handleReaction = async (type: ReactionType) => {
        if (!canReact || !accessToken) return

        const existing = localReactions.find(r => r.type === type)
        const isRemoving = existing?.hasReacted

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${accessToken}`
        }

        try {
            if (isRemoving) {
                await fetch(`/api/forum/reactions?${targetType}_id=${targetId}&reaction_type=${type}`, {
                    method: 'DELETE',
                    headers
                })
            } else {
                await fetch('/api/forum/reactions', {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        [`${targetType}_id`]: targetId,
                        reaction_type: type
                    })
                })
            }

            // Update local state
            setLocalReactions(prev =>
                prev.map(r =>
                    r.type === type
                        ? { ...r, count: isRemoving ? r.count - 1 : r.count + 1, hasReacted: !isRemoving }
                        : r
                )
            )
        } catch (error) {
            console.error('Reaction error:', error)
        }

        setShowPicker(false)
    }

    const activeReactions = localReactions.filter(r => r.count > 0)

    return (
        <div className={styles.reactionBar}>
            {activeReactions.map(r => (
                <button
                    key={r.type}
                    className={`${styles.reactionButton} ${r.hasReacted ? styles.active : ''}`}
                    onClick={() => handleReaction(r.type)}
                    disabled={!canReact}
                >
                    {REACTION_EMOJIS[r.type]} {r.count}
                </button>
            ))}

            {canReact && (
                <div className={styles.addReaction}>
                    <button
                        className={styles.addReactionButton}
                        onClick={() => setShowPicker(!showPicker)}
                    >
                        +
                    </button>

                    {showPicker && (
                        <div className={styles.reactionPicker}>
                            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                                <button
                                    key={type}
                                    className={styles.pickerOption}
                                    onClick={() => handleReaction(type as ReactionType)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Simple Markdown Renderer
function MarkdownContent({ content }: { content: string }) {
    // Basic markdown transformation
    const html = content
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Line breaks
        .replace(/\n/g, '<br />')
        // @mentions
        .replace(/@(\w+)/g, '<span class="mention">@$1</span>')

    return (
        <div
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

// Helper function
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'току-що'
    if (diffMins < 60) return `преди ${diffMins} мин`
    if (diffHours < 24) return `преди ${diffHours} часа`
    if (diffDays < 7) return `преди ${diffDays} дни`

    return date.toLocaleDateString('bg-BG', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
}
