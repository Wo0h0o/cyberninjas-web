'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'

export default function ResourcesPage() {
    const [content, setContent] = useState<string>('')
    const [sections, setSections] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [isFlipping, setIsFlipping] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Load the markdown content
        // URL encode the Cyrillic filename
        const filename = encodeURIComponent('ТЕРМИНОЛОГИЯ В ПРАКТИКАТА НА AI.md')

        fetch(`/content/${filename}`)
            .then(res => {
                console.log('Fetch response status:', res.status)
                console.log('Fetch response headers:', res.headers)

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`)
                }

                return res.text()
            })
            .then(text => {
                console.log('Fetched content length:', text.length)
                console.log('First 200 chars:', text.substring(0, 200))

                // Check if it's HTML error page instead of markdown
                if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                    throw new Error('Received HTML instead of markdown - file not found')
                }

                setContent(text)
                // Split content by phase sections for pagination
                const parts = text.split(/(?=###\s+\*\*\*🗺️)/g)
                const splitSections: string[] = []

                // Further split each phase into smaller chunks for better readability
                parts.forEach(part => {
                    const subsections = part.split(/(?=---\n\n\*\*)/g)
                    subsections.forEach(subsection => {
                        if (subsection.trim().length > 500) {
                            // Split long sections into ~2000 character chunks
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400">Зареждане на съдържанието...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <div className="mb-6">
                        <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Грешка при зареждане</h2>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4 text-left text-sm text-gray-500">
                            <p className="mb-2">Възможни причини:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Файлът все още се копира в public/content</li>
                                <li>Проблем с URL encoding на кирилицата</li>
                                <li>Next.js все още не е презаредил статичните файлове</li>
                            </ul>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
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
                    <p className="text-gray-400">Няма namерено съдържание</p>
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
                        <BookOpen className="w-10 h-10 text-purple-400" />
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="gradient-text">Ресурси</span> за AI
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Терминология в практиката на AI - Интерактивна книга
                    </p>
                </motion.div>
            </div>

            {/* Book Container */}
            <div className="max-w-6xl mx-auto">
                <div className="relative" style={{ perspective: '2000px' }}>
                    {/* Book Wrapper */}
                    <div className="relative min-h-[600px] md:min-h-[700px]">
                        {/* Left Page (Even pages on desktop, hidden on mobile) */}
                        <div className="hidden md:block absolute left-0 top-0 w-1/2 h-full pr-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`left-${currentPage}`}
                                    initial={{ rotateY: -90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: 90, opacity: 0 }}
                                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                                    className="w-full h-full"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="book-page book-page-left h-full overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                                        {currentPage > 0 && (
                                            <div className="prose prose-invert max-w-none">
                                                <ReactMarkdown>
                                                    {sections[currentPage - 1]}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right Page (Odd pages / Main page on mobile) */}
                        <div className="w-full md:w-1/2 md:absolute md:right-0 md:top-0 h-full md:pl-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`right-${currentPage}`}
                                    initial={{ rotateY: 90, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    exit={{ rotateY: -90, opacity: 0 }}
                                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                                    className="w-full h-full"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <div className="book-page book-page-right h-full overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                                        <div className="prose prose-invert max-w-none">
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

                        {/* Book Spine (visible on desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-0 w-1 h-full -translate-x-1/2 bg-gradient-to-b from-purple-500/20 via-purple-600/30 to-purple-500/20 shadow-lg shadow-purple-500/50" />
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-8 gap-4">
                        <motion.button
                            onClick={prevPage}
                            disabled={currentPage === 0 || isFlipping}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Предишна</span>
                        </motion.button>

                        {/* Progress Indicator */}
                        <div className="flex-1 max-w-md">
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
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
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="hidden sm:inline">Следваща</span>
                            <ChevronRight className="w-5 h-5" />
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
                    font-size: 1.875rem;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .prose-invert h2 {
                    font-size: 1.5rem;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    color: #a855f7;
                }

                .prose-invert h3 {
                    font-size: 1.25rem;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .prose-invert p {
                    line-height: 1.75;
                    margin-bottom: 1rem;
                }

                .prose-invert strong {
                    color: #c084fc;
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
                    background: rgba(168, 85, 247, 0.1);
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                    color: #c084fc;
                }

                /* Custom Scrollbar */
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }

                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }

                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.5);
                    border-radius: 3px;
                }

                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.7);
                }
            `}</style>
        </div>
    )
}
