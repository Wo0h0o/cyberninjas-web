'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { ChevronUp, ChevronDown, BookOpen, Bookmark, BookmarkCheck, ZoomIn, ZoomOut, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useResourceBookmarks } from '@/hooks/useResourceBookmarks'

const RESOURCE_SLUG = 'ai-terminology'

interface BookmarkData {
    page_index: number
    page_title: string | null
}

export default function ResourcesPage() {
    const { user } = useAuth()
    const { isBookmarked: isResourceBookmarked, toggleBookmark: toggleResourceBookmark, bookmarkCount } = useResourceBookmarks()
    const [sections, setSections] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [isFlipping, setIsFlipping] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Enhanced features
    const [bookmarks, setBookmarks] = useState<BookmarkData[]>([])
    const [bookmarksLoading, setBookmarksLoading] = useState(true)
    const [textZoom, setTextZoom] = useState(100) // 50-150%

    // Fetch bookmarks from Supabase
    const fetchBookmarks = useCallback(async () => {
        if (!user) {
            setBookmarksLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('bookmark_data')
                .select('page_index, page_title')
                .eq('user_id', user.id)
                .eq('resource_slug', RESOURCE_SLUG)
                .order('page_index', { ascending: true })

            if (error) throw error
            setBookmarks(data || [])
        } catch (err) {
            console.error('Error fetching bookmarks:', err)
        } finally {
            setBookmarksLoading(false)
        }
    }, [user])

    // Toggle bookmark for current page
    const toggleBookmark = async () => {
        if (!user) return

        const isBookmarked = bookmarks.some(b => b.page_index === currentPage)

        try {
            if (isBookmarked) {
                await supabase
                    .from('bookmark_data')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('resource_slug', RESOURCE_SLUG)
                    .eq('page_index', currentPage)

                setBookmarks(prev => prev.filter(b => b.page_index !== currentPage))
            } else {
                const pageTitle = extractPageTitle(sections[currentPage])
                await supabase
                    .from('bookmark_data')
                    .insert({
                        user_id: user.id,
                        resource_slug: RESOURCE_SLUG,
                        page_index: currentPage,
                        page_title: pageTitle
                    })

                setBookmarks(prev => [...prev, { page_index: currentPage, page_title: pageTitle }].sort((a, b) => a.page_index - b.page_index))
            }
        } catch (err) {
            console.error('Error toggling bookmark:', err)
        }
    }

    const extractPageTitle = (text: string): string => {
        const match = text.match(/^#+\s*(.+)$/m)
        return match ? match[1].substring(0, 50) : `Страница ${currentPage + 1}`
    }

    const goToPage = (pageIndex: number) => {
        if (pageIndex >= 0 && pageIndex < sections.length) {
            setCurrentPage(pageIndex)
        }
    }

    useEffect(() => {
        const filename = encodeURIComponent('ТЕРМИНОЛОГИЯ В ПРАКТИКАТА НА AI.md')

        fetch(`/content/${filename}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                return res.text()
            })
            .then(text => {
                if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                    throw new Error('Received HTML instead of markdown - file not found')
                }

                const parts = text.split(/(?=###\s+\*\*\*🗺️)/g)
                const splitSections: string[] = []

                parts.forEach(part => {
                    const subsections = part.split(/(?=---\n\n\*\*)/g)
                    subsections.forEach(subsection => {
                        if (subsection.trim().length > 500) {
                            const words = subsection.split(' ')
                            let chunk = ''
                            words.forEach(word => {
                                if (chunk.length + word.length > 2000) {
                                    splitSections.push(chunk.trim())
                                    chunk = word + ' '
                                } else {
                                    chunk += word + ' '
                                }
                            })
                            if (chunk.trim()) splitSections.push(chunk.trim())
                        } else if (subsection.trim()) {
                            splitSections.push(subsection.trim())
                        }
                    })
                })

                setSections(splitSections)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error loading content:', err)
                setError(err.message || 'Failed to load content')
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        fetchBookmarks()
    }, [fetchBookmarks])

    const nextPage = () => {
        if (currentPage < sections.length - 1 && !isFlipping) {
            setIsFlipping(true)
            setTimeout(() => {
                setCurrentPage(prev => prev + 1)
                setIsFlipping(false)
            }, 300)
        }
    }

    const prevPage = () => {
        if (currentPage > 0 && !isFlipping) {
            setIsFlipping(true)
            setTimeout(() => {
                setCurrentPage(prev => prev - 1)
                setIsFlipping(false)
            }, 300)
        }
    }

    const isCurrentPageBookmarked = bookmarks.some(b => b.page_index === currentPage)

    // Render bookmarks panel (only for page 0)
    const renderBookmarksPanel = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Bookmark className="w-16 h-16 text-accent-yellow mb-6" />
            <h2 className="text-3xl font-bold gradient-text mb-8">Вашите отметки</h2>

            {bookmarksLoading ? (
                <div className="w-8 h-8 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
            ) : bookmarks.length === 0 ? (
                <p className="text-gray-500 text-lg">Все още няма отметки</p>
            ) : (
                <div className="space-y-3 w-full max-w-md">
                    {bookmarks.map((bookmark) => (
                        <button
                            key={bookmark.page_index}
                            onClick={() => goToPage(bookmark.page_index)}
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-accent-yellow/20 hover:border-accent-yellow/30 transition-all duration-300 text-left flex items-center gap-3"
                        >
                            <BookmarkCheck className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                            <span className="text-white truncate">
                                {bookmark.page_title || `Страница ${bookmark.page_index + 1}`}
                            </span>
                            <span className="text-gray-500 text-sm ml-auto">
                                стр. {bookmark.page_index + 1}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Зареждане на съдържанието...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Грешка при зареждане</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-xl bg-accent-yellow hover:bg-accent-yellow-hover text-text-on-yellow font-medium transition-colors"
                    >
                        Опитай отново
                    </button>
                </div>
            </div>
        )
    }

    if (sections.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Няма намерено съдържание</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="w-10 h-10 text-accent-yellow" />
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="gradient-text">Ресурси</span> за AI
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Терминология в практиката на AI - Интерактивна книга
                    </p>
                </motion.div>

                {/* Controls Bar */}
                <div className="flex items-center justify-center gap-4 flex-wrap mt-6">
                    {/* Page Selector */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-gray-400 text-sm">Страница:</span>
                        <select
                            value={currentPage}
                            onChange={(e) => goToPage(Number(e.target.value))}
                            className="bg-transparent border-none text-white font-medium focus:outline-none cursor-pointer"
                        >
                            {sections.map((_, index) => (
                                <option key={index} value={index} className="bg-gray-900">
                                    {index + 1}
                                </option>
                            ))}
                        </select>
                        <span className="text-gray-500 text-sm">от {sections.length}</span>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <button
                            onClick={() => setTextZoom(prev => Math.max(50, prev - 10))}
                            disabled={textZoom <= 50}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                            title="По-малък текст"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="w-12 text-center text-sm font-medium">{textZoom}%</span>
                        <button
                            onClick={() => setTextZoom(prev => Math.min(150, prev + 10))}
                            disabled={textZoom >= 150}
                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                            title="По-голям текст"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Bookmark Toggle */}
                    {user && (
                        <button
                            onClick={toggleBookmark}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isCurrentPageBookmarked
                                ? 'bg-accent-yellow/30 border-accent-yellow text-text-on-yellow'
                                : 'bg-white/5 border-white/10 hover:bg-accent-yellow/20 hover:border-accent-yellow/30'
                                }`}
                            title={isCurrentPageBookmarked ? 'Премахни отметка' : 'Добави отметка'}
                        >
                            {isCurrentPageBookmarked ? (
                                <BookmarkCheck className="w-5 h-5" />
                            ) : (
                                <Bookmark className="w-5 h-5" />
                            )}
                            <span className="hidden sm:inline">
                                {isCurrentPageBookmarked ? 'Отметнато' : 'Отметни'}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Book Container */}
            <div className="max-w-6xl mx-auto">
                <div className="relative" style={{ perspective: '2000px' }}>
                    {/* Book Wrapper */}
                    <div className="relative min-h-[600px] md:min-h-[700px]">
                        {/* Left Page */}
                        <div className="hidden md:block absolute left-0 top-0 w-1/2 h-full pr-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`left-${currentPage}`}
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="w-full h-full"
                                >
                                    <div className="book-page book-page-left h-full overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-accent-yellow/50 scrollbar-track-transparent">
                                        {currentPage === 0 ? (
                                            // Page 1: Show bookmarks panel
                                            renderBookmarksPanel()
                                        ) : (
                                            // Other pages: Show previous page content
                                            <div
                                                className="prose prose-invert max-w-none"
                                                style={{ fontSize: `${textZoom}%` }}
                                            >
                                                <ReactMarkdown>
                                                    {sections[currentPage - 1]}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right Page - Shows current content */}
                        <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 h-full md:pl-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`right-${currentPage}`}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="w-full h-full"
                                >
                                    <div className="book-page book-page-right h-full overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-accent-yellow/50 scrollbar-track-transparent min-h-[600px] md:min-h-[700px]">
                                        <div
                                            className="prose prose-invert max-w-none"
                                            style={{ fontSize: `${textZoom}%` }}
                                        >
                                            <ReactMarkdown>
                                                {sections[currentPage]}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Page Number */}
                                        <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-white/10">
                                            Страница {currentPage + 1} от {sections.length}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Book Spine */}
                        <div className="hidden md:block absolute left-1/2 top-0 w-1 h-full -translate-x-1/2 bg-gradient-to-b from-accent-yellow/20 via-accent-yellow/30 to-accent-yellow/20 shadow-lg shadow-accent-yellow/50" />
                    </div>

                    {/* Vertical Navigation Controls */}
                    <div className="flex justify-between items-center mt-8 gap-4">
                        <motion.button
                            onClick={prevPage}
                            disabled={currentPage === 0 || isFlipping}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-accent-yellow/20 hover:border-accent-yellow/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronUp className="w-5 h-5" />
                            <span className="hidden sm:inline">Предишна</span>
                        </motion.button>

                        {/* Progress Indicator */}
                        <div className="flex-1 max-w-md">
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-accent-yellow"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentPage + 1) / sections.length) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-2">
                                {Math.round(((currentPage + 1) / sections.length) * 100)}% прочетено
                            </p>
                        </div>

                        <motion.button
                            onClick={nextPage}
                            disabled={currentPage === sections.length - 1 || isFlipping}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-accent-yellow/20 hover:border-accent-yellow/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="hidden sm:inline">Следваща</span>
                            <ChevronDown className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .book-page {
                    background: linear-gradient(135deg, 
                        rgba(17, 17, 27, 0.95) 0%, 
                        rgba(25, 25, 40, 0.95) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 
                        0 20px 60px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                .book-page-left {
                    border-radius: 20px 0 0 20px;
                    border-right: none;
                }

                .book-page-right {
                    border-radius: 0 20px 20px 0;
                    border-left: none;
                }

                @media (max-width: 768px) {
                    .book-page-right {
                        border-radius: 20px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                }

                .prose-invert {
                    color: #e5e7eb;
                }

                .prose-invert h1, .prose-invert h2, .prose-invert h3 {
                    color: #f3f4f6;
                    font-weight: 700;
                }

                .prose-invert h1 {
                    font-size: 1.875em;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #FFFF00 0%, #E6E600 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .prose-invert h2 {
                    font-size: 1.5em;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    color: #FFFF00;
                }

                .prose-invert h3 {
                    font-size: 1.25em;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .prose-invert p {
                    line-height: 1.75;
                    margin-bottom: 1rem;
                }

                .prose-invert strong {
                    color: #E6E600;
                    font-weight: 600;
                }

                .prose-invert ul, .prose-invert ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }

                .prose-invert li {
                    margin-bottom: 0.5rem;
                }

                .prose-invert code {
                    background: rgba(255, 255, 0, 0.1);
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                    color: #FFFF00;
                }

                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }

                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }

                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 0, 0.5);
                    border-radius: 3px;
                }

                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 0, 0.7);
                }

                .gradient-text {
                    background: linear-gradient(135deg, #FFFF00 0%, #E6E600 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
        </div>
    )
}
