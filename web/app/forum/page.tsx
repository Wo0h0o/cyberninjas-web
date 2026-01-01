'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { ForumCategory, ForumTopic } from '@/lib/forum-types'
import { TRUST_LEVEL_NAMES, calculateTrustLevel } from '@/lib/forum-types'
import {
    Bot,
    BookOpen,
    Lightbulb,
    HelpCircle,
    FileText,
    Users,
    Hand,
    Rocket,
    BarChart3,
    Tag,
    Trophy,
    Link2,
    CheckCircle2,
    Pin,
    MessageSquare,
    Eye,
    Search,
    Plus,
    ChevronRight,
    Sparkles,
    Zap,
    Shield,
    Star,
    GraduationCap,
    User,
    LogOut,
    Sun,
    Moon,
} from 'lucide-react'
import styles from './Forum.module.css'

// Lucide icon components for categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'ai-automations': <Bot className={styles.lucideIcon} />,
    'courses-resources': <BookOpen className={styles.lucideIcon} />,
    'ideas-projects': <Lightbulb className={styles.lucideIcon} />,
    'questions': <HelpCircle className={styles.lucideIcon} />,
}

// Trust level icons (Lucide)
const TRUST_ICONS: Record<number, React.ReactNode> = {
    1: <Sparkles size={14} />,
    2: <Zap size={14} />,
    3: <Star size={14} />,
    4: <Shield size={14} />,
}

// Starter topics for empty state
const STARTER_TOPICS = [
    {
        icon: <FileText size={24} />,
        title: 'Правила на форума',
        description: 'Преди да започнеш, запознай се с насоките за общуване',
        href: '/forum/topic/rules',
        color: '#8B5CF6'
    },
    {
        icon: <HelpCircle size={24} />,
        title: 'Как да задаваме добри въпроси',
        description: 'Научи как да получаваш по-бързи и по-точни отговори',
        href: '/forum/topic/how-to-ask',
        color: '#10B981'
    },
    {
        icon: <Hand size={24} />,
        title: 'Представете се тук',
        description: 'Кажи здравей на общността и сподели какво те интересува',
        href: '/forum/topic/introductions',
        color: '#F59E0B'
    },
    {
        icon: <Lightbulb size={24} />,
        title: 'Идеи за AI проекти',
        description: 'Търсиш вдъхновение? Виж какво правят другите',
        href: '/forum/topic/project-ideas',
        color: '#EF4444'
    }
]

// Popular tags for sidebar
const POPULAR_TAGS = [
    { name: 'ChatGPT', count: 0 },
    { name: 'Midjourney', count: 0 },
    { name: 'Автоматизация', count: 0 },
    { name: 'Python', count: 0 },
    { name: 'Промптове', count: 0 },
]

export default function ForumPage() {
    const { user, profile, signOut } = useAuth()
    const [categories, setCategories] = useState<ForumCategory[]>([])
    const [topics, setTopics] = useState<ForumTopic[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<ForumTopic[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [topContributors, setTopContributors] = useState<{ user_id: string, name: string, avatar_url: string | null, points: number }[]>([])
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('forumTheme') as 'light' | 'dark' | null
        if (savedTheme) {
            setTheme(savedTheme)
        } else {
            // Use system preference
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

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/forum/categories')
                const data = await res.json()
                if (data.categories) {
                    setCategories(data.categories)
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategories()
    }, [])

    // Fetch top contributors
    useEffect(() => {
        async function fetchTopContributors() {
            try {
                const res = await fetch('/api/forum/top-contributors?limit=5')
                const data = await res.json()
                if (data.contributors) {
                    setTopContributors(data.contributors)
                }
            } catch (error) {
                console.error('Error fetching top contributors:', error)
            }
        }
        fetchTopContributors()
    }, [])

    // Fetch topics
    const fetchTopics = useCallback(async (cursor?: string, category?: string | null, sort?: string) => {
        try {
            if (cursor) {
                setLoadingMore(true)
            } else {
                setLoading(true)
            }

            const params = new URLSearchParams()
            if (cursor) params.set('cursor', cursor)
            if (category) params.set('category', category)
            if (sort) params.set('sort', sort)

            const res = await fetch(`/api/forum/topics?${params.toString()}`)
            const data = await res.json()

            if (data.topics) {
                if (cursor) {
                    setTopics(prev => [...prev, ...data.topics])
                } else {
                    setTopics(data.topics)
                }
                setNextCursor(data.nextCursor)
            }
        } catch (error) {
            console.error('Error fetching topics:', error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [])

    // Initial fetch and refetch on filter change
    useEffect(() => {
        setTopics([])
        setNextCursor(null)
        fetchTopics(undefined, activeCategory, sortBy)
    }, [activeCategory, sortBy, fetchTopics])

    // Infinite scroll observer
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextCursor && !loadingMore) {
                    fetchTopics(nextCursor, activeCategory, sortBy)
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [nextCursor, loadingMore, activeCategory, sortBy, fetchTopics])

    // Search handler with debounce
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        const timeoutId = setTimeout(async () => {
            try {
                const res = await fetch(`/api/forum/search?q=${encodeURIComponent(searchQuery)}&type=topics&limit=5`)
                const data = await res.json()
                setSearchResults(data.topics || [])
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    // Focus search on open
    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [showSearch])

    const handleCategoryClick = (slug: string | null) => {
        setActiveCategory(slug)
    }

    // Calculate total stats (hide zeros)
    const totalTopics = categories.reduce((sum, cat) => sum + cat.topics_count, 0)
    const totalPosts = categories.reduce((sum, cat) => sum + cat.posts_count, 0)

    return (
        <div className={styles.forumContainer} data-theme={theme}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <Link href="/">Начало</Link>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbCurrent}>Форум</span>
                {activeCategory && (
                    <>
                        <span className={styles.breadcrumbSep}>/</span>
                        <span className={styles.breadcrumbCurrent}>
                            {categories.find(c => c.slug === activeCategory)?.name}
                        </span>
                    </>
                )}
            </nav>

            {/* Header with Search in Top Right */}
            <header className={styles.forumHeader}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.forumTitle}>
                        <span className={styles.gradientText}>Форум</span>
                    </h1>
                    <p className={styles.forumSubtitle}>
                        Общността на CyberNinjas – споделяй, питай, учи
                    </p>
                </div>

                <div className={styles.headerRight}>
                    {/* Search Toggle */}
                    <div className={styles.searchWrapper}>
                        {showSearch ? (
                            <div className={styles.searchExpanded}>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Търси..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInput}
                                    onBlur={() => {
                                        if (!searchQuery) setShowSearch(false)
                                    }}
                                />
                                {isSearching && <div className={styles.searchSpinner} />}
                                <button
                                    className={styles.searchClose}
                                    onClick={() => {
                                        setShowSearch(false)
                                        setSearchQuery('')
                                    }}
                                >
                                    ✕
                                </button>

                                {/* Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className={styles.searchDropdown}>
                                        {searchResults.map((topic) => (
                                            <Link
                                                key={topic.id}
                                                href={`/forum/topic/${topic.slug}`}
                                                className={styles.searchResult}
                                                onClick={() => {
                                                    setSearchQuery('')
                                                    setShowSearch(false)
                                                }}
                                            >
                                                <span className={styles.searchResultTitle}>{topic.title}</span>
                                                <span className={styles.searchResultMeta}>
                                                    {topic.category_name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className={styles.searchButton}
                                onClick={() => setShowSearch(true)}
                                aria-label="Търси"
                            >
                                <Search size={20} />
                            </button>
                        )}
                    </div>

                    {/* New Topic Button - Primary CTA */}
                    {user ? (
                        <Link href="/forum/new" className={styles.newTopicButton}>
                            <Plus size={18} />
                            <span>Нова тема</span>
                        </Link>
                    ) : (
                        <Link href="/login" className={styles.newTopicButton}>
                            Влез, за да пишеш
                        </Link>
                    )}

                    {/* Theme Toggle Button */}
                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Светъл режим' : 'Тъмен режим'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* User Profile Avatar in Header */}
                    {user && profile ? (
                        <div className={styles.headerUserMenu}>
                            <div className={styles.headerAvatar}>
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.name || ''} />
                                ) : (
                                    <span>{(profile.name || 'U').charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className={styles.headerUserDropdown}>
                                <div className={styles.dropdownHeader}>
                                    <span className={styles.dropdownName}>{profile.name || 'Потребител'}</span>
                                    <span className={styles.dropdownLevel}>
                                        {TRUST_ICONS[1]} Ниво 1
                                    </span>
                                </div>
                                <button onClick={() => signOut()} className={styles.dropdownLogout}>
                                    <LogOut size={16} />
                                    Изход
                                </button>
                            </div>
                        </div>
                    ) : !user ? (
                        <Link href="/login?redirect=/forum" className={styles.headerLoginButton}>
                            <User size={18} />
                        </Link>
                    ) : null}
                </div>
            </header>

            {/* Main Content with Sidebar Layout */}
            <div className={styles.mainLayout}>
                {/* Left Column - Topics */}
                <main className={styles.mainContent}>
                    {/* Categories with Color Coding */}
                    <nav className={styles.categoriesNav}>
                        <button
                            className={`${styles.categoryPill} ${!activeCategory ? styles.active : ''}`}
                            onClick={() => handleCategoryClick(null)}
                        >
                            Всички
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`${styles.categoryPill} ${activeCategory === cat.slug ? styles.active : ''}`}
                                onClick={() => handleCategoryClick(cat.slug)}
                                style={{ '--cat-color': cat.color } as React.CSSProperties}
                            >
                                <span className={styles.categoryIconWrapper}>
                                    {CATEGORY_ICONS[cat.slug] || <Bot className={styles.lucideIcon} />}
                                </span>
                                {cat.name}
                                {cat.topics_count > 0 && (
                                    <span className={styles.categoryCount}>{cat.topics_count}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Sort Options */}
                    <div className={styles.sortBar}>
                        <span className={styles.sortLabel}>Подреди по:</span>
                        <button
                            className={`${styles.sortOption} ${sortBy === 'latest' ? styles.active : ''}`}
                            onClick={() => setSortBy('latest')}
                        >
                            Най-нови
                        </button>
                        <button
                            className={`${styles.sortOption} ${sortBy === 'popular' ? styles.active : ''}`}
                            onClick={() => setSortBy('popular')}
                        >
                            Най-популярни
                        </button>
                    </div>

                    {/* Topics List */}
                    <div className={styles.topicsContainer}>
                        {loading ? (
                            <div className={styles.loadingState}>
                                <div className={styles.loadingSpinner} />
                                <p>Зареждане...</p>
                            </div>
                        ) : topics.length === 0 ? (
                            /* Starter Topics - Empty State */
                            <div className={styles.emptyState}>

                                <div className={styles.starterGrid}>
                                    {STARTER_TOPICS.map((topic, i) => (
                                        <Link
                                            key={i}
                                            href={topic.href}
                                            className={styles.starterCard}
                                            style={{ '--accent': topic.color } as React.CSSProperties}
                                        >
                                            <span className={styles.starterIcon} style={{ color: topic.color }}>
                                                {topic.icon}
                                            </span>
                                            <div className={styles.starterContent}>
                                                <h4>{topic.title}</h4>
                                                <p>{topic.description}</p>
                                            </div>
                                            <ChevronRight size={20} className={styles.starterArrowIcon} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {topics.map((topic) => (
                                    <TopicCard key={topic.id} topic={topic} />
                                ))}

                                {/* Infinite scroll trigger */}
                                <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                                    {loadingMore && (
                                        <div className={styles.loadingMore}>
                                            <div className={styles.loadingSpinner} />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className={styles.sidebar}>
                    {/* Forum Stats */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>
                            <BarChart3 size={18} className={styles.sidebarIcon} />
                            Статистика
                        </h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{totalTopics || '—'}</span>
                                <span className={styles.statLabel}>Теми</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{totalPosts || '—'}</span>
                                <span className={styles.statLabel}>Постове</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>—</span>
                                <span className={styles.statLabel}>Членове</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>
                                    <span className={styles.onlineDot} />
                                    {user ? '1' : '—'}
                                </span>
                                <span className={styles.statLabel}>Онлайн</span>
                            </div>
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>
                            <Tag size={18} className={styles.sidebarIcon} />
                            Популярни тагове
                        </h3>
                        <div className={styles.tagCloud}>
                            {POPULAR_TAGS.map((tag, i) => (
                                <button
                                    key={i}
                                    className={styles.tagButton}
                                    onClick={() => setSearchQuery(tag.name)}
                                >
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>
                            <Trophy size={18} className={styles.sidebarIcon} />
                            Топ контрибутори
                        </h3>
                        <div className={styles.leaderboard}>
                            {topContributors.length > 0 ? (
                                topContributors.map((contributor, index) => (
                                    <div key={contributor.user_id} className={styles.leaderboardItem}>
                                        <span className={styles.leaderboardRank}>#{index + 1}</span>
                                        <div className={styles.leaderboardAvatar}>
                                            {contributor.avatar_url ? (
                                                <img src={contributor.avatar_url} alt={contributor.name} />
                                            ) : (
                                                <span>{contributor.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <span className={styles.leaderboardName}>{contributor.name}</span>
                                        <span className={styles.leaderboardPoints}>{contributor.points} т.</span>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.leaderboardEmpty}>
                                    <p>Бъди първият!</p>
                                    <span>Помогни на общността и се качи тук</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>
                            <Link2 size={18} className={styles.sidebarIcon} />
                            Бързи връзки
                        </h3>
                        <div className={styles.quickLinks}>
                            <Link href="/dashboard" className={styles.primaryQuickLink}>
                                <Rocket size={16} /> ← Обратно в платформата
                            </Link>
                            <Link href="/forum/topic/rules">
                                <FileText size={16} /> Правила
                            </Link>
                            <Link href="/forum/topic/how-to-ask">
                                <HelpCircle size={16} /> Как да питам
                            </Link>
                            <Link href="/dashboard/courses">
                                <GraduationCap size={16} /> Към курсовете
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

// Topic Card Component
function TopicCard({ topic }: { topic: ForumTopic }) {
    const trustLevel = calculateTrustLevel(topic.author_level || 1)

    // Get category color for left border
    const categoryColors: Record<string, string> = {
        'ai-automations': '#8B5CF6',
        'courses-resources': '#10B981',
        'ideas-projects': '#F59E0B',
        'questions': '#EF4444'
    }
    const borderColor = topic.category_slug ? categoryColors[topic.category_slug] || '#8B5CF6' : '#8B5CF6'

    return (
        <Link
            href={`/forum/topic/${topic.slug}`}
            className={styles.topicCard}
            style={{ '--border-color': borderColor } as React.CSSProperties}
        >
            <div className={styles.topicContent}>
                <div className={styles.topicHeader}>
                    <div className={styles.topicTags}>
                        {topic.category_slug && (
                            <span
                                className={styles.categoryBadge}
                                style={{ '--cat-color': borderColor } as React.CSSProperties}
                            >
                                <span className={styles.categoryBadgeIcon}>
                                    {CATEGORY_ICONS[topic.category_slug] || <Bot size={12} />}
                                </span>
                                {topic.category_name}
                            </span>
                        )}
                        {topic.is_solved && (
                            <span className={styles.solvedBadge}>
                                <CheckCircle2 size={12} /> Решено
                            </span>
                        )}
                        {topic.is_pinned && (
                            <span className={styles.pinnedBadge}>
                                <Pin size={14} />
                            </span>
                        )}
                    </div>
                </div>

                <h3 className={styles.topicTitle}>{topic.title}</h3>

                {topic.preview && (
                    <p className={styles.topicPreview}>{topic.preview}</p>
                )}

                <div className={styles.topicFooter}>
                    <div className={styles.authorInfo}>
                        <div className={styles.avatar}>
                            {topic.author_avatar ? (
                                <img src={topic.author_avatar} alt={topic.author_name} />
                            ) : (
                                <span>{topic.author_name?.charAt(0) || '?'}</span>
                            )}
                        </div>
                        <span className={styles.authorName}>{topic.author_name || 'Анонимен'}</span>
                        <span className={styles.trustBadge} title={TRUST_LEVEL_NAMES[trustLevel]}>
                            {TRUST_ICONS[trustLevel]}
                        </span>
                    </div>

                    <div className={styles.topicStats}>
                        {topic.posts_count > 0 && (
                            <span className={styles.stat}>
                                <MessageSquare size={14} />
                                {topic.posts_count}
                            </span>
                        )}
                        {topic.views_count > 0 && (
                            <span className={styles.stat}>
                                <Eye size={14} />
                                {topic.views_count}
                            </span>
                        )}
                        <span className={styles.timeAgo}>
                            {formatTimeAgo(topic.last_activity_at)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

// Helper function for relative time
function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'току-що'
    if (diffMins < 60) return `${diffMins} мин`
    if (diffHours < 24) return `${diffHours} ч`
    if (diffDays < 7) return `${diffDays} дни`

    return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })
}
