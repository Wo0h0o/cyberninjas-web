'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
}

const navItems: NavItem[] = [
    {
        label: 'Преглед',
        href: '/dashboard',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: 'Курсове',
        href: '/dashboard/courses',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
                <path d="M8 7H16M8 11H14" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: 'Промптове',
        href: '/dashboard/prompts',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                <path d="M12 12L20 7.5" />
                <path d="M12 12V21" />
                <path d="M12 12L4 7.5" />
            </svg>
        ),
    },
    {
        label: 'Любими',
        href: '/dashboard/prompts/favorites',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        ),
    },
    {
        label: 'Профил',
        href: '/dashboard/profile',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" strokeLinecap="round" />
            </svg>
        ),
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, signOut } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard'
        return pathname.startsWith(href)
    }

    const handleLogout = async () => {
        console.log('Logout clicked!')
        await signOut()
        console.log('Signed out, redirecting...')
        router.push('/')
    }

    // Get user initials
    const getInitials = () => {
        if (!profile?.name) return 'U'
        const parts = profile.name.split(' ')
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return profile.name[0].toUpperCase()
    }

    // Get subscription label
    const getSubscriptionLabel = () => {
        if (profile?.subscription_tier === 'paid') return 'Pro Plan'
        return 'Безплатен план'
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    {isOpen ? (
                        <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={clsx(
                    'fixed left-0 top-0 h-screen w-72 z-50',
                    'bg-white/[0.02] backdrop-blur-xl',
                    'border-r border-white/10',
                    'flex flex-col',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
                initial={false}
                animate={{ x: isOpen ? 0 : undefined }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/lms-logo.png"
                            alt="CyberNinjas"
                            className="h-10 w-auto"
                        />
                        <span className="text-xl font-bold">
                            Cyber<span className="gradient-text">Ninjas</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl',
                                    'transition-all duration-300',
                                    'group relative overflow-hidden',
                                    active
                                        ? 'bg-purple-500/20 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {/* Active indicator */}
                                {active && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-purple-400 to-fuchsia-400"
                                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    />
                                )}

                                <span className={clsx(
                                    'transition-colors duration-300',
                                    active ? 'text-purple-400' : 'text-gray-500 group-hover:text-purple-400'
                                )}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>

                                {/* Hover glow */}
                                <motion.div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.15), transparent 60%)',
                                    }}
                                />
                            </Link>
                        )
                    })}

                    {/* Admin Link - only for admins */}
                    {profile?.role === 'admin' && (
                        <Link
                            href="/dashboard/admin"
                            onClick={() => setIsOpen(false)}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl',
                                'transition-all duration-300',
                                'group relative overflow-hidden',
                                isActive('/dashboard/admin')
                                    ? 'bg-red-500/20 text-white'
                                    : 'text-red-400 hover:text-white hover:bg-red-500/10'
                            )}
                        >
                            {isActive('/dashboard/admin') && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-red-400 to-orange-400"
                                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                />
                            )}
                            <span className={clsx(
                                'transition-colors duration-300',
                                isActive('/dashboard/admin') ? 'text-red-400' : 'text-red-500 group-hover:text-red-400'
                            )}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </span>
                            <span className="font-medium">Admin</span>
                        </Link>
                    )}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{getInitials()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {profile?.name || 'Потребител'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{getSubscriptionLabel()}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Изход"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <polyline points="16,17 21,12 16,7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    )
}

