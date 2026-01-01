'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useGuide } from '@/hooks/useGuides'
import { ChevronDown, FileText, Video, Download, Headphones, CheckCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'

interface GuidePageProps {
    params: Promise<{ slug: string }>
}

export default function GuidePage({ params }: GuidePageProps) {
    const resolvedParams = use(params)
    const { guide, loading, error } = useGuide(resolvedParams.slug)
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['0']))
    const [activeFormat, setActiveFormat] = useState<{ [key: string]: string }>({})

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev)
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId)
            } else {
                newSet.add(moduleId)
            }
            return newSet
        })
    }

    // Custom markdown components
    const markdownComponents = {
        img: ({ src, alt }: any) => (
            <div className="my-6 flex justify-center">
                <img
                    src={src}
                    alt={alt}
                    className="rounded-xl max-w-full h-auto shadow-lg"
                    loading="lazy"
                />
            </div>
        ),
    }

    if (loading) {
        return <div className="space-y-8">
            <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
            <div className="h-96 rounded-2xl bg-white/[0.03] animate-pulse" />
        </div>
    }

    if (error || !guide) {
        return <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-white mb-3">Ръководството не е намерено</h2>
            <Link href="/dashboard/guides" className="text-accent-yellow hover:text-accent-yellow-hover">
                ← Обратно към ръководствата
            </Link>
        </div>
    }

    return (
        <div className="space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
                    Преглед
                </Link>
                <span className="text-gray-600">/</span>
                <Link href="/dashboard/guides" className="text-gray-500 hover:text-white transition-colors">
                    Ръководства
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-white">{guide.title}</span>
            </nav>

            {/* Guide Hero */}
            <div className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {guide.title}
                </h1>
                {guide.description && (
                    <p className="text-lg text-gray-400 mb-6">
                        {guide.description}
                    </p>
                )}

                {guide.introduction && (
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown components={markdownComponents}>{guide.introduction}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Modules with Content */}
            <div className="space-y-4">
                {guide.modules.map((module, moduleIndex) => {
                    const isExpanded = expandedModules.has(moduleIndex.toString())

                    return (
                        <div
                            key={module.id}
                            className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
                        >
                            <button
                                onClick={() => toggleModule(moduleIndex.toString())}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-accent-yellow">
                                        {String(moduleIndex + 1).padStart(2, '0')}
                                    </span>
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                                        {module.description && (
                                            <p className="text-sm text-gray-400">{module.description}</p>
                                        )}
                                    </div>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isExpanded && (
                                <div className="px-6 pb-6">
                                    <div className="space-y-6 mt-4">
                                        {module.content.map((content) => {
                                            const contentKey = `${module.id}-${content.id}`
                                            const currentFormat = activeFormat[contentKey] || 'text'

                                            return (
                                                <div key={content.id} className="border-t border-white/10 pt-6 first:border-0 first:pt-0">
                                                    <h4 className="text-xl font-semibold text-white mb-4">
                                                        {content.title}
                                                    </h4>

                                                    {/* Format Tabs */}
                                                    <div className="mb-4 flex flex-wrap gap-2">
                                                        {content.content_text && (
                                                            <button
                                                                onClick={() => setActiveFormat(prev => ({ ...prev, [contentKey]: 'text' }))}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentFormat === 'text'
                                                                    ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                                                                    : 'bg-white/5 text-gray-400 hover:text-white'
                                                                    }`}
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                Текст
                                                            </button>
                                                        )}
                                                        {content.pdf_url && (
                                                            <button
                                                                onClick={() => setActiveFormat(prev => ({ ...prev, [contentKey]: 'pdf' }))}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentFormat === 'pdf'
                                                                    ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                                                                    : 'bg-white/5 text-gray-400 hover:text-white'
                                                                    }`}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                PDF
                                                            </button>
                                                        )}
                                                        {content.video_url && (
                                                            <button
                                                                onClick={() => setActiveFormat(prev => ({ ...prev, [contentKey]: 'video' }))}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentFormat === 'video'
                                                                    ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                                                                    : 'bg-white/5 text-gray-400 hover:text-white'
                                                                    }`}
                                                            >
                                                                <Video className="w-4 h-4" />
                                                                Видео
                                                            </button>
                                                        )}
                                                        {content.audio_url && (
                                                            <button
                                                                onClick={() => setActiveFormat(prev => ({ ...prev, [contentKey]: 'audio' }))}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentFormat === 'audio'
                                                                    ? 'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30'
                                                                    : 'bg-white/5 text-gray-400 hover:text-white'
                                                                    }`}
                                                            >
                                                                <Headphones className="w-4 h-4" />
                                                                Аудио
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Content Display */}
                                                    <div className="mt-4">
                                                        {/* Text Content */}
                                                        {currentFormat === 'text' && content.content_text && (
                                                            <div className="prose prose-invert max-w-none">
                                                                <ReactMarkdown components={markdownComponents}>
                                                                    {content.content_text}
                                                                </ReactMarkdown>
                                                            </div>
                                                        )}

                                                        {/* PDF */}
                                                        {currentFormat === 'pdf' && content.pdf_url && (
                                                            <a
                                                                href={content.pdf_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-yellow hover:bg-accent-yellow-hover text-text-on-yellow font-semibold transition-colors"
                                                            >
                                                                <Download className="w-5 h-5" />
                                                                Изтегли PDF
                                                            </a>
                                                        )}

                                                        {/* Video */}
                                                        {currentFormat === 'video' && content.video_url && (
                                                            <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                                                <iframe
                                                                    src={content.video_url}
                                                                    className="w-full h-full"
                                                                    allowFullScreen
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Audio */}
                                                        {currentFormat === 'audio' && content.audio_url && (
                                                            <audio
                                                                controls
                                                                className="w-full"
                                                                src={content.audio_url}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
