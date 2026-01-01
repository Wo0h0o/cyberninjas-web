'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAchievements } from '@/hooks/useAchievements'
import { Trophy, X, Zap } from 'lucide-react'
import { useState } from 'react'

export function AchievementToast() {
    const { recentlyUnlocked } = useAchievements()
    const [isDismissed, setIsDismissed] = useState(false)

    // Reset dismissed state when new achievement
    if (recentlyUnlocked && isDismissed) {
        setIsDismissed(false)
    }

    if (!recentlyUnlocked || isDismissed) {
        return null
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 300
                }}
                className="fixed top-6 right-6 z-50 max-w-md"
            >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/95 to-yellow-900/95 backdrop-blur-xl border-2 border-accent-yellow/50 shadow-2xl">
                    {/* Animated background glow */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-accent-yellow/30 to-amber-500/30"
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />

                    {/* Sparkle effect */}
                    <motion.div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/20 blur-3xl"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />

                    <div className="relative z-10 p-6">
                        {/* Close button */}
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-300" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                initial={{ rotate: -180, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    damping: 10,
                                    stiffness: 200,
                                    delay: 0.2
                                }}
                                className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
                            >
                                <Trophy className="w-8 h-8 text-white" />
                            </motion.div>

                            <div className="flex-1 min-w-0">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm font-medium text-accent-yellow uppercase tracking-wider"
                                >
                                    Achievement Unlocked!
                                </motion.p>
                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl font-bold text-white truncate"
                                >
                                    {recentlyUnlocked.icon} {recentlyUnlocked.name}
                                </motion.h3>
                            </div>
                        </div>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-300 text-sm mb-4"
                        >
                            {recentlyUnlocked.description}
                        </motion.p>

                        {/* XP Reward */}
                        {recentlyUnlocked.xp_reward > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent-yellow/30 border border-accent-yellow/50"
                            >
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <span className="text-lg font-bold text-white">
                                    +{recentlyUnlocked.xp_reward} XP
                                </span>
                            </motion.div>
                        )}

                        {/* Tier badge */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="absolute bottom-3 left-3 text-xs text-accent-yellow"
                        >
                            {recentlyUnlocked.tier === 1 && '⭐ Tier 1'}
                            {recentlyUnlocked.tier === 2 && '⭐⭐ Tier 2'}
                            {recentlyUnlocked.tier === 3 && '🔒 Secret'}
                            {recentlyUnlocked.tier === 4 && '👑 Legendary'}
                        </motion.div>
                    </div>

                    {/* Progress bar animation (auto-dismiss indicator) */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-yellow to-accent-yellow-hover"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 5, ease: 'linear' }}
                        style={{ transformOrigin: 'left' }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
