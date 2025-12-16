'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

const aiCharacters = [
    // AI symbols and commands
    '{', '}', '[', ']', '<', '>', '/', '\\', '|',
    'AI', 'GPT', 'ML', 'NN', 'DL',
    '0', '1', '$', '#', '@', '*', '+', '-', '=',
    // Prompt-related
    'prompt', 'ctx', 'role', 'sys', 'usr', 'msg',
    // Bulgarian
    'АИ', 'код', 'бот',
]

interface RainColumn {
    id: number
    x: number
    characters: string[]
    speed: number
    depth: number // 0-1, where 1 is closest
    delay: number
    blur: number
}

export function CodeRain({ columns = 30 }: { columns?: number }) {
    const rainColumns = useMemo(() => {
        return Array.from({ length: columns }, (_, i) => {
            const depth = Math.random() // 0-1
            const speed = 15 + depth * 20 // Closer = faster
            const charCount = 8 + Math.floor(Math.random() * 8) // 8-16 characters

            return {
                id: i,
                x: (i / columns) * 100,
                characters: Array.from({ length: charCount }, () =>
                    aiCharacters[Math.floor(Math.random() * aiCharacters.length)]
                ),
                speed,
                depth,
                delay: Math.random() * 5,
                blur: (1 - depth) * 2, // Further = more blur
            } as RainColumn
        })
    }, [columns])

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {rainColumns.map((column) => {
                // Calculate opacity and color based on depth
                const opacity = 0.15 + column.depth * 0.3
                const brightness = 0.5 + column.depth * 0.5

                return (
                    <motion.div
                        key={column.id}
                        className="absolute top-0 font-mono text-sm whitespace-pre"
                        style={{
                            left: `${column.x}%`,
                            filter: `blur(${column.blur}px)`,
                            color: `rgba(168, 85, 247, ${brightness})`,
                            textShadow: `0 0 ${5 + column.depth * 10}px rgba(168, 85, 247, ${opacity})`,
                        }}
                        animate={{
                            y: ['0vh', '110vh'],
                        }}
                        transition={{
                            duration: column.speed,
                            delay: column.delay,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        {column.characters.map((char, idx) => {
                            // Gradient fade at the tail
                            const charOpacity = Math.min(1, (idx + 1) / 5)
                            const isHead = idx < 3

                            return (
                                <motion.div
                                    key={idx}
                                    style={{
                                        opacity: charOpacity * opacity,
                                        color: isHead
                                            ? `rgba(220, 200, 255, ${brightness})` // Brighter head
                                            : `rgba(168, 85, 247, ${brightness})`,
                                        fontSize: `${0.9 + column.depth * 0.3}rem`,
                                        lineHeight: '1.5',
                                    }}
                                    animate={isHead ? {
                                        opacity: [charOpacity * opacity, charOpacity * opacity * 1.5, charOpacity * opacity],
                                    } : {}}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatType: 'reverse',
                                    }}
                                >
                                    {char}
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )
            })}
        </div>
    )
}
