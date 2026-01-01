'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { trackActivity, FeatureArea } from '@/lib/activityTracker'
import { GraduationCap, Sparkles, BookOpen, FolderOpen, LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
    GraduationCap,
    Sparkles,
    BookOpen,
    FolderOpen
}

interface FeatureChoiceCardProps {
    href: string
    icon: string // Lucide icon name
    label: string
    description: string
    badge?: 'free' | 'paid'
    index?: number
    featureArea: FeatureArea
}

export function FeatureChoiceCard({
    href,
    icon,
    label,
    description,
    badge,
    index = 0,
    featureArea
}: FeatureChoiceCardProps) {

    const handleClick = async () => {
        // Track that user chose this feature
        await trackActivity({
            activityType: featureArea === 'courses' ? 'lesson_started' :
                featureArea === 'prompts' ? 'prompt_viewed' :
                    featureArea === 'guides' ? 'guide_viewed' :
                        'resource_viewed',
            featureArea,
            metadata: { source: 'first_time_choice' }
        })
    }

    const IconComponent = iconMap[icon] || Sparkles

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Link
                href={href}
                onClick={handleClick}
                className="feature-choice-card group block"
            >
                {/* Icon Circle */}
                <div className="icon-circle">
                    <IconComponent className="w-8 h-8 text-accent-yellow" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-accent-yellow transition-colors">
                            {label}
                        </h3>

                        {badge && (
                            <span className={`badge ${badge === 'paid' ? 'badge-paid' : 'badge-free'}`}>
                                {badge === 'paid' ? 'Платено' : 'Безплатно'}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {description}
                    </p>
                </div>

                {/* Hover Arrow */}
                <div className="mt-4 flex items-center text-accent-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Разглеждане</span>
                    <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </Link>
        </motion.div>
    )
}
