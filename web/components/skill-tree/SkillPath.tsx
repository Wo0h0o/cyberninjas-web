'use client'

import { motion } from 'framer-motion'

interface SkillPathProps {
    from: { x: number; y: number }
    to: { x: number; y: number }
    isActive: boolean
    isCompleted?: boolean
    isGoldPath?: boolean  // Both nodes are completed (gold to gold)
    branch?: 'visual' | 'personal' | 'code' | 'writing'
}

// OLED Void Design - Single accent color
const ACCENT_COLOR = '#00D4FF'
const GOLD_COLOR = '#FFD700'
const INACTIVE_COLOR = '#1a1a1a'

// Sample points along quadratic bezier curve
function sampleBezierCurve(from: { x: number, y: number }, to: { x: number, y: number }, samples: number = 20) {
    const midY = (from.y + to.y) / 2
    const midX = (from.x + to.x) / 2

    const points: { x: number, y: number }[] = []

    for (let i = 0; i <= samples; i++) {
        const t = i / samples

        if (t <= 0.5) {
            const t2 = t * 2
            const p0 = from
            const p1 = { x: from.x, y: midY }
            const p2 = { x: midX, y: midY }

            const x = (1 - t2) * (1 - t2) * p0.x + 2 * (1 - t2) * t2 * p1.x + t2 * t2 * p2.x
            const y = (1 - t2) * (1 - t2) * p0.y + 2 * (1 - t2) * t2 * p1.y + t2 * t2 * p2.y
            points.push({ x, y })
        } else {
            const t2 = (t - 0.5) * 2
            const p0 = { x: midX, y: midY }
            const p1 = { x: to.x, y: midY }
            const p2 = to

            const x = (1 - t2) * (1 - t2) * p0.x + 2 * (1 - t2) * t2 * p1.x + t2 * t2 * p2.x
            const y = (1 - t2) * (1 - t2) * p0.y + 2 * (1 - t2) * t2 * p1.y + t2 * t2 * p2.y
            points.push({ x, y })
        }
    }

    return points
}

// Single Comet component with trail
function Comet({
    curvePoints,
    delay = 0,
    duration = 2.5,
    color = ACCENT_COLOR
}: {
    curvePoints: { x: number, y: number }[]
    delay?: number
    duration?: number
    color?: string
}) {
    const xPoints = curvePoints.map(p => p.x)
    const yPoints = curvePoints.map(p => p.y)

    // Generate opacity values - fade in, stay bright, fade out
    const opacityValues = curvePoints.map((_, i) => {
        const t = i / (curvePoints.length - 1)
        if (t < 0.1) return t * 10 // Fade in
        if (t > 0.95) return (1 - t) * 20 // Fade out at end
        return 1
    })

    // Determine glow colors based on main color
    const isGold = color === GOLD_COLOR
    const glowRgba = isGold ? 'rgba(255, 215, 0, ' : 'rgba(0, 212, 255, '

    return (
        <g>
            {/* Comet Trail - Multiple circles with decreasing opacity */}
            {[0, 1, 2, 3, 4, 5].map((trailIndex) => (
                <motion.circle
                    key={`trail-${trailIndex}`}
                    r={4 - trailIndex * 0.5}
                    fill={color}
                    opacity={0}
                    animate={{
                        cx: xPoints,
                        cy: yPoints,
                        opacity: opacityValues.map(o => o * (1 - trailIndex * 0.15))
                    }}
                    transition={{
                        duration,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.2, 1], // ease-in-out cubic
                        delay: delay + trailIndex * 0.04, // Stagger trail
                        repeatDelay: 2,
                    }}
                    style={{
                        filter: trailIndex === 0
                            ? `drop-shadow(0 0 12px ${glowRgba}1)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))`
                            : `drop-shadow(0 0 ${6 - trailIndex}px ${glowRgba}${0.8 - trailIndex * 0.12}))`,
                    }}
                />
            ))}

            {/* Bright photon head */}
            <motion.circle
                r={2}
                fill={isGold ? '#FFFACD' : '#ffffff'}
                opacity={0}
                animate={{
                    cx: xPoints,
                    cy: yPoints,
                    opacity: opacityValues
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    delay,
                    repeatDelay: 2,
                }}
                style={{
                    filter: isGold
                        ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 1)) drop-shadow(0 0 6px rgba(255, 215, 0, 1))'
                        : 'drop-shadow(0 0 8px rgba(255, 255, 255, 1)) drop-shadow(0 0 4px rgba(0, 212, 255, 1))',
                }}
            />
        </g>
    )
}

export function SkillPath({ from, to, isActive, isCompleted, isGoldPath }: SkillPathProps) {
    const midY = (from.y + to.y) / 2
    const midX = (from.x + to.x) / 2
    const pathD = `M ${from.x} ${from.y} Q ${from.x} ${midY}, ${midX} ${midY} T ${to.x} ${to.y}`

    // Sample curve points for animation
    const curvePoints = sampleBezierCurve(from, to, 24)

    // Determine comet color based on path type
    const cometColor = isGoldPath ? GOLD_COLOR : ACCENT_COLOR
    const pathColor = isGoldPath ? GOLD_COLOR : ACCENT_COLOR
    const pathGlowRgba = isGoldPath ? 'rgba(255, 215, 0, 0.4)' : 'rgba(0, 212, 255, 0.4)'

    return (
        <g>
            {/* Base path - subtle dark line */}
            <path
                d={pathD}
                fill="none"
                stroke={INACTIVE_COLOR}
                strokeWidth="1"
                strokeLinecap="round"
            />

            {/* Active path - Blue or Gold glow */}
            {isActive && (
                <motion.path
                    d={pathD}
                    fill="none"
                    stroke={pathColor}
                    strokeWidth="1"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                    }}
                    style={{
                        filter: `drop-shadow(0 0 2px ${pathGlowRgba})`,
                    }}
                />
            )}

            {/* Multiple comets with staggered timing for traffic effect */}
            {isCompleted && (
                <>
                    <Comet curvePoints={curvePoints} delay={0} duration={2.2} color={cometColor} />
                    <Comet curvePoints={curvePoints} delay={1.5} duration={2.4} color={cometColor} />
                    <Comet curvePoints={curvePoints} delay={3.2} duration={2.0} color={cometColor} />
                </>
            )}
        </g>
    )
}
