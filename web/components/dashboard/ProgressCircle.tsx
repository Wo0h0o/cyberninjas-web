'use client'

import { motion } from 'framer-motion'

interface ProgressCircleProps {
    percentage: number
    size?: number
    strokeWidth?: number
    showLabel?: boolean
    className?: string
}

export function ProgressCircle({
    percentage,
    size = 80,
    strokeWidth = 6,
    showLabel = true,
    className = '',
}: ProgressCircleProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFFF00" />
                        <stop offset="100%" stopColor="#E6E600" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Label */}
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className="text-lg font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        {percentage}%
                    </motion.span>
                </div>
            )}
        </div>
    )
}
