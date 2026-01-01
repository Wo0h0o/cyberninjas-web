import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ActionLink {
    href: string
    label: string
    icon: string
}

interface ActionMenuProps {
    links: ActionLink[]
    initiallyExpanded?: boolean
}

export function ActionMenu({ links, initiallyExpanded = false }: ActionMenuProps) {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded)

    // Show only 4 links initially (Progressive Disclosure)
    const visibleLinks = isExpanded ? links : links.slice(0, 4)
    const hasMore = links.length > 4

    return (
        <section className="action-menu" aria-label="Additional resources">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Subtle heading */}
                <h2 className="text-sm font-medium text-gray-500 mb-6 text-center">
                    Разгледай още
                </h2>

                {/* Text links grid - NO glassmorphism cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <AnimatePresence mode="sync">
                        {visibleLinks.map((link, index) => (
                            <motion.div
                                key={link.href}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={link.href}
                                    className="action-link group"
                                >
                                    <span className="text-xl mr-3">{link.icon}</span>
                                    <span className="text-sm font-medium text-gray-400 group-hover:text-accent-yellow transition-colors">
                                        {link.label}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Expand/Collapse toggle */}
                {hasMore && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="expand-button"
                        aria-expanded={isExpanded}
                    >
                        <span className="text-xs text-gray-500">
                            {isExpanded ? 'Покажи по-малко' : 'Виж всички опции'}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                            <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                    </button>
                )}
            </div>
        </section>
    )
}
