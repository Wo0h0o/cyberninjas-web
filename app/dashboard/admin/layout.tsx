'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { AdminGuard } from '@/components/admin/AdminGuard'

interface AdminLayoutProps {
    children: React.ReactNode
}

const adminNavItems = [
    {
        label: 'Преглед',
        href: '/dashboard/admin',
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
        label: 'Академия',
        href: '/dashboard/admin/courses',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
    },
    {
        label: 'Библиотеки',
        href: '/dashboard/admin/libraries',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" />
                <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" />
            </svg>
        ),
    },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === '/dashboard/admin') return pathname === '/dashboard/admin'
        return pathname.startsWith(href)
    }

    return (
        <AdminGuard>
            <div className="space-y-6">
                {/* Admin Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Админ панел</h1>
                        </div>
                        <p className="text-gray-400 text-sm">Управление на съдържанието</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        ← Към Dashboard
                    </Link>
                </div>

                {/* Admin Navigation */}
                <nav className="flex gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/10">
                    {adminNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                                isActive(item.href)
                                    ? 'bg-purple-500/20 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <span className={isActive(item.href) ? 'text-purple-400' : 'text-gray-500'}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Content */}
                <div>{children}</div>
            </div>
        </AdminGuard>
    )
}
