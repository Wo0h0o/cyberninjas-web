'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useUserLevel } from '@/hooks/useUserLevel'
import { X } from 'lucide-react'
import Image from 'next/image'

interface CompanionMessage {
    id: string
    code: string
    trigger_type: string
    message_template: string
    avatar_emotion: 'happy' | 'excited' | 'mysterious' | 'supportive'
    action_buttons: Array<{
        label: string
        action: string
        params?: any
    }>
}

export function NinjaCompanion() {
    const { user, profile } = useAuth()
    const { userLevel } = useUserLevel()
    const [currentMessage, setCurrentMessage] = useState<CompanionMessage | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [hasShownWelcome, setHasShownWelcome] = useState(false)

    useEffect(() => {
        // Show welcome message once per day (not just once per session)
        if (user && !hasShownWelcome) {
            const lastShownDate = localStorage.getItem('ninja_welcome_shown')
            const today = new Date().toDateString()

            // Show if never shown, or if last shown was a different day
            if (!lastShownDate || lastShownDate !== today) {
                const timer = setTimeout(() => {
                    showWelcomeMessage()
                    setHasShownWelcome(true)
                    localStorage.setItem('ninja_welcome_shown', today)
                }, 2000) // Delay 2 seconds after page load

                return () => clearTimeout(timer)
            } else {
                // Already shown today, don't show again
                setHasShownWelcome(true)
            }
        }
    }, [user, hasShownWelcome])

    function showWelcomeMessage() {
        const welcomeMessages = [
            {
                id: '1',
                code: 'welcome_1',
                trigger_type: 'welcome',
                message_template: `Здравей {{name}}!\n\nГотов ли си да продължиш приключението?`,
                avatar_emotion: 'happy' as const,
                action_buttons: [
                    { label: 'Да започваме!', action: 'dismiss' }
                ]
            },
            {
                id: '2',
                code: 'welcome_2',
                trigger_type: 'welcome',
                message_template: `Добре дошъл обратно, {{name}}!\n\nИмам нещо интересно за теб...`,
                avatar_emotion: 'excited' as const,
                action_buttons: [
                    { label: 'Покажи ми', action: 'dismiss' },
                    { label: 'По-късно', action: 'dismiss' }
                ]
            }
        ]

        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
        setCurrentMessage(randomMessage)
        setIsVisible(true)
    }

    function renderMessage(template: string): string {
        const firstName = profile?.name?.split(' ')[0] || 'там'
        return template
            .replace(/{{name}}/g, firstName)
            .replace(/{{user\.name}}/g, firstName)
            .replace(/{{streak_days}}/g, String(userLevel?.streak_days || 0))
            .replace(/{{level}}/g, String(userLevel?.level || 1))
    }

    function handleAction(action: string) {
        if (action === 'dismiss') {
            setIsVisible(false)
            // Smooth scroll to welcome section for better UX
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        // TODO: Add more actions (navigate to courses, show tutorial, etc.)
    }

    function handleDismiss() {
        setIsVisible(false)
    }

    if (!currentMessage) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 400, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: 400, opacity: 0, scale: 0.9 }}
                    transition={{
                        type: 'spring',
                        damping: 20,
                        stiffness: 300
                    }}
                    className="fixed bottom-6 right-6 z-50 w-full max-w-md"
                >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/95 to-fuchsia-900/95 backdrop-blur-xl border-2 border-purple-500/50 shadow-2xl">
                        {/* Animated background glow */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20"
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        />

                        {/* Sparkle effect */}
                        <motion.div
                            className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-fuchsia-500/30 blur-3xl"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        />

                        <div className="relative z-10 p-6">
                            {/* Close button */}
                            <button
                                onClick={handleDismiss}
                                className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-gray-300" />
                            </button>

                            {/* Horizontal Layout: Ninja Left, Text Right */}
                            <div className="flex items-center gap-6 mb-6">
                                {/* Ninja Avatar - Larger on Left */}
                                <motion.div
                                    animate={{
                                        y: [0, -8, 0],
                                        rotate: [0, 2, -2, 0]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                    className="relative flex-shrink-0 w-32 h-32"
                                >
                                    <Image
                                        src="/content/ninja-companion.png"
                                        alt="Ninja Companion"
                                        width={128}
                                        height={128}
                                        unoptimized
                                        className="w-full h-full object-contain drop-shadow-2xl"
                                    />
                                </motion.div>

                                {/* Message - On Right */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex-1"
                                >
                                    <p className="text-white text-base leading-relaxed whitespace-pre-line">
                                        {renderMessage(currentMessage.message_template)}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Action Buttons */}
                            {currentMessage.action_buttons && currentMessage.action_buttons.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex gap-3"
                                >
                                    {currentMessage.action_buttons.map((button, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAction(button.action)}
                                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${index === 0
                                                ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            {button.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Subtle bottom accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
