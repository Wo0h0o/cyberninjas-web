'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { MoreHorizontal, X } from 'lucide-react'

interface BottomNavItem {
    label: string
    href: string
    icon: React.ReactNode
    badge?: number
}

const mainNavItems: BottomNavItem[] = [
    {
        label: 'Преглед',
        href: '/dashboard',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: 'Академия',
        href: '/dashboard/courses',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
                <path d="M8 7H16M8 11H14" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: 'AI команди',
        href: '/dashboard/prompts',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                <path d="M12 12L20 7.5" />
                <path d="M12 12V21" />
                <path d="M12 12L4 7.5" />
            </svg>
        ),
    },
    {
        label: 'Профил',
        href: '/dashboard/profile',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" strokeLinecap="round" />
            </svg>
        ),
    },
]

const moreNavItems: BottomNavItem[] = [
    {
        label: 'Форум',
        href: '/forum',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="12" y1="7" x2="12" y2="13" />
            </svg>
        ),
    },
    {
        label: 'Ръководства',
        href: '/dashboard/guides',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
                <path d="M8 7H16M8 11H14" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: 'Ресурси',
        href: '/dashboard/resources',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
    },
    {
        label: 'Платформи',
        href: '/dashboard/platforms',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: 'FAQ',
        href: '/dashboard/faq',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
]

export function BottomNav() {
    const pathname = usePathname()
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard'
        return pathname.startsWith(href)
    }

    const isMoreActive = moreNavItems.some(item => isActive(item.href))

    return (
        <>
            {/* More Menu Modal */}
            <AnimatePresence>
                {showMoreMenu && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMoreMenu(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed bottom-16 left-0 right-0 z-[70] bg-gray-950/98 backdrop-blur-xl border-t border-white/10 rounded-t-3xl"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Още</h3>
                                    <button
                                        onClick={() => setShowMoreMenu(false)}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-2">
                                    {moreNavItems.map((item) => {
                                        const active = isActive(item.href)
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setShowMoreMenu(false)}
                                                className={clsx(
                                                    'flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300',
                                                    active
                                                        ? 'bg-accent-yellow/20 text-white border border-accent-yellow/30'
                                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                                                )}
                                            >
                                                <span className={clsx(
                                                    'transition-colors',
                                                    active ? 'text-accent-yellow' : 'text-gray-500'
                                                )}>
                                                    {item.icon}
                                                </span>
                                                <span className="font-medium text-lg">{item.label}</span>
                                                {active && (
                                                    <motion.div
                                                        layoutId="moreActiveIndicator"
                                                        className="ml-auto w-2 h-2 rounded-full bg-accent-yellow"
                                                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                                    />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
                <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
                    {/* Main Nav Items */}
                    {mainNavItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'relative flex flex-col items-center justify-center gap-1',
                                    'transition-all duration-300',
                                    'tap-highlight-transparent',
                                    active
                                        ? 'text-accent-yellow'
                                        : 'text-gray-500 active:text-gray-300'
                                )}
                            >
                                {/* Active indicator */}
                                {active && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full bg-gradient-to-r from-accent-yellow to-accent-yellow-hover"
                                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    />
                                )}

                                {/* Icon */}
                                <span className={clsx(
                                    'transition-transform duration-200',
                                    active ? 'scale-110' : 'scale-100'
                                )}>
                                    {item.icon}
                                </span>

                                {/* Label */}
                                <span className={clsx(
                                    'text-xs font-medium transition-all duration-200',
                                    active ? 'opacity-100' : 'opacity-70'
                                )}>
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge && item.badge > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 right-4 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
                                    >
                                        <span className="text-xs font-bold text-white">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    </motion.div>
                                )}

                                {/* Touch feedback */}
                                <motion.div
                                    className="absolute inset-0 bg-accent-yellow/10 rounded-lg opacity-0"
                                    whileTap={{ opacity: 1 }}
                                    transition={{ duration: 0.1 }}
                                />
                            </Link>
                        )
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className={clsx(
                            'relative flex flex-col items-center justify-center gap-1',
                            'transition-all duration-300',
                            'tap-highlight-transparent',
                            isMoreActive || showMoreMenu
                                ? 'text-accent-yellow'
                                : 'text-gray-500 active:text-gray-300'
                        )}
                    >
                        {/* Active indicator */}
                        {(isMoreActive || showMoreMenu) && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full bg-gradient-to-r from-accent-yellow to-accent-yellow-hover"
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            />
                        )}

                        {/* Icon */}
                        <motion.span
                            className={clsx(
                                'transition-transform duration-200',
                                (isMoreActive || showMoreMenu) ? 'scale-110' : 'scale-100'
                            )}
                            animate={{ rotate: showMoreMenu ? 90 : 0 }}
                        >
                            <MoreHorizontal className="w-6 h-6" />
                        </motion.span>

                        {/* Label */}
                        <span className={clsx(
                            'text-xs font-medium transition-all duration-200',
                            (isMoreActive || showMoreMenu) ? 'opacity-100' : 'opacity-70'
                        )}>
                            Още
                        </span>

                        {/* Touch feedback */}
                        <motion.div
                            className="absolute inset-0 bg-accent-yellow/10 rounded-lg opacity-0"
                            whileTap={{ opacity: 1 }}
                            transition={{ duration: 0.1 }}
                        />
                    </button>
                </div>
            </nav>
        </>
    )
}
