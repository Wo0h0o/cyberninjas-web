import Link from 'next/link'
import { BookOpen, Clock, Zap } from 'lucide-react'

interface ProgressStats {
    coursesCompleted: number
    totalCourses: number
    timeWatched: string
    currentLevel: number
}

interface ProgressOverviewProps {
    stats: ProgressStats
    collapsed?: boolean
}

export function ProgressOverview({ stats, collapsed = true }: ProgressOverviewProps) {
    if (!collapsed) {
        // Full version - redirect to profile anyway
        return null
    }

    // Collapsed: Minimal context strip
    return (
        <section className="progress-overview" aria-label="Quick progress overview">
            <div className="max-w-5xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Mini cards - read-only, muted */}
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="mini-stat-card">
                            <div className="flex items-center gap-3">
                                <div className="mini-icon">
                                    <BookOpen className="w-5 h-5 text-accent-yellow" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">
                                        {stats.coursesCompleted}/{stats.totalCourses}
                                    </p>
                                    <p className="text-xs text-gray-500">курсове</p>
                                </div>
                            </div>
                        </div>

                        <div className="mini-stat-card">
                            <div className="flex items-center gap-3">
                                <div className="mini-icon">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">
                                        {stats.timeWatched}
                                    </p>
                                    <p className="text-xs text-gray-500">гледано</p>
                                </div>
                            </div>
                        </div>

                        <div className="mini-stat-card">
                            <div className="flex items-center gap-3">
                                <div className="mini-icon">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">
                                        Level {stats.currentLevel}
                                    </p>
                                    <p className="text-xs text-gray-500">опит</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escape hatch to detailed view */}
                    <Link
                        href="/dashboard/profile"
                        className="text-sm text-gray-500 hover:text-accent-yellow transition-colors whitespace-nowrap"
                    >
                        Виж детайлен прогрес →
                    </Link>
                </div>
            </div>
        </section>
    )
}
