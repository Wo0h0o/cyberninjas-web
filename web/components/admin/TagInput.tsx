'use client'

import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'

interface TagInputProps {
    value: string[]
    onChange: (tags: string[]) => void
    suggestions?: string[]
    placeholder?: string
}

export function TagInput({ value, onChange, suggestions = [], placeholder = 'Добави таг...' }: TagInputProps) {
    const [input, setInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (input.length > 0) {
            const filtered = suggestions
                .filter(s => s.toLowerCase().includes(input.toLowerCase()))
                .filter(s => !value.includes(s))
                .slice(0, 8)
            setFilteredSuggestions(filtered)
            setShowSuggestions(filtered.length > 0)
        } else {
            setShowSuggestions(false)
        }
    }, [input, suggestions, value])

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const addTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
        }
        setInput('')
        setShowSuggestions(false)
        inputRef.current?.focus()
    }

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter(t => t !== tagToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            if (input.trim()) {
                addTag(input)
            }
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value[value.length - 1])
        }
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500 transition-colors min-h-[48px]">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-sm"
                    >
                        #{tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-white transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => input && setShowSuggestions(filteredSuggestions.length > 0)}
                    className="flex-1 min-w-[120px] bg-transparent text-white focus:outline-none placeholder:text-gray-500"
                    placeholder={value.length === 0 ? placeholder : ''}
                />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
                <div className="absolute z-10 mt-2 w-full rounded-xl bg-gray-800 border border-white/10 shadow-xl overflow-hidden">
                    {filteredSuggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            #{suggestion}
                        </button>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
                Натисни Enter или запетая за добавяне
            </p>
        </div>
    )
}
