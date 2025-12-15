'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    required?: boolean
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 10, required }: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(false)

    // Simple markdown to HTML conversion for preview
    const renderMarkdown = (text: string) => {
        return text
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mb-2">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-white mb-2">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mb-3">$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
            .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-purple-400 font-mono text-sm">$1</code>')
            .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$2</li>')
            .replace(/\n\n/g, '</p><p class="mb-3">')
            .replace(/\n/g, '<br/>')
    }

    return (
        <div className="space-y-2">
            {/* Toggle buttons */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className={clsx(
                        'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                        !showPreview ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    )}
                >
                    ✏️ Редактиране
                </button>
                <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={clsx(
                        'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                        showPreview ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    )}
                >
                    👁️ Преглед
                </button>
            </div>

            {/* Editor or Preview */}
            {showPreview ? (
                <div
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 min-h-[200px] prose prose-invert max-w-none"
                    style={{ minHeight: `${rows * 24}px` }}
                    dangerouslySetInnerHTML={{ __html: `<p class="mb-3">${renderMarkdown(value || '<span class="text-gray-500">Няма съдържание</span>')}</p>` }}
                />
            ) : (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                    rows={rows}
                    placeholder={placeholder}
                    required={required}
                />
            )}

            {/* Help text */}
            <p className="text-xs text-gray-500">
                Поддържа Markdown: **bold**, *italic*, `code`, # заглавия, - списъци
            </p>
        </div>
    )
}
