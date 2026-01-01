'use client'

import { motion } from 'framer-motion'
import { useUserLevel } from '@/hooks/useUserLevel'
import { Trophy, Zap, Flame } from 'lucide-react'

export function LevelHeader() {
    const { userLevel, loading } = useUserLevel()

    if (loading || !userLevel) {
        return (
            <div className="mb-8 p-6 rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse">
                <div className="h-20"></div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-accent-yellow/10 via-amber-500/5 to-yellow-500/10 border border-accent-yellow/20 relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Left: Level Info */}
                <div className="flex items-center gap-6">
                    {/* Level Badge */}
                    <motion.div
                        className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-yellow to-accent-yellow-hover flex items-center justify-center relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-yellow to-accent-yellow-hover blur opacity-50" />
                        <div className="relative flex flex-col items-center">
                            <div className="text-3xl font-bold text-black">{userLevel.level}</div>
                            <div className="mt-1 text-[10px] font-semibold text-black/70 whitespace-nowrap">
                                НИВО
                            </div>
                        </div>
                    </motion.div>

                    {/* Title & Progress */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-white">
                                {userLevel.title}
                            </h2>

                            {/* Streak Badge */}
                            {userLevel.streak_days > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
                                >
                                    <Flame className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm font-bold text-orange-300">
                                        {userLevel.streak_days} day{userLevel.streak_days !== 1 ? 's' : ''}
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* XP Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white">
                                    <Zap className="w-4 h-4 inline mr-1 text-accent-yellow" />
                                    {userLevel.xp.toLocaleString()} XP
                                </span>
                                {userLevel.level < 20 && (
                                    <span className="text-accent-yellow font-semibold">
                                        {userLevel.xp_to_next_level.toLocaleString()} до Ниво {userLevel.level + 1}
                                    </span>
                                )}
                            </div>

                            {userLevel.level < 20 ? (
                                <div className="w-full md:w-96 h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${userLevel.progress_percentage}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-accent-yellow via-accent-yellow-hover to-amber-500 rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <Trophy className="w-5 h-5" />
                                    <span className="font-semibold">Max Level Reached!</span>
                                </div>
                            )}

                            {userLevel.level < 20 && (
                                <div className="text-xs text-gray-500">
                                    {userLevel.progress_percentage}% progress
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Stats */}
                <div className="flex gap-4">
                    <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-white">{userLevel.level}</div>
                        <div className="text-xs text-gray-400">Ниво</div>
                    </div>

                    <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-bold text-white">
                            {userLevel.xp.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">Общо XP</div>
                    </div>

                    {userLevel.streak_days > 0 && (
                        <div className="text-center px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                                <Flame className="w-5 h-5" />
                                {userLevel.streak_days}
                            </div>
                            <div className="text-xs text-orange-300">Day Streak</div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
