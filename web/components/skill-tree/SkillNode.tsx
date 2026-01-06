'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export interface SkillNodeData {
    id: string
    title: string
    subtitle: string
    type: 'lesson' | 'prompt' | 'resource' | 'milestone'
    status: 'locked' | 'available' | 'current' | 'completed' | 'mastered'
    position: { x: number; y: number }
    xpReward: number
    prerequisites?: string[]
    branch?: 'visual' | 'personal' | 'code' | 'writing'
    icon?: LucideIcon
}

interface SkillNodeProps {
    node: SkillNodeData
    cx: number
    cy: number
    onClick: () => void
}

// Render Lucide icon as SVG path inside the hexagon
function NodeIcon({ node, cx, cy, color }: { node: SkillNodeData; cx: number; cy: number; color: string }) {
    const Icon = node.icon
    if (!Icon) return null

    const iconSize = 26
    const x = cx - iconSize / 2
    const y = cy - iconSize / 2

    return (
        <foreignObject x={x} y={y} width={iconSize} height={iconSize}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
            }}>
                <Icon size={iconSize} color={color} strokeWidth={1.5} />
            </div>
        </foreignObject>
    )
}

// OLED Void Design - Monochromatic with Electric Blue accent
const ACCENT_COLOR = '#00D4FF' // Electric Blue
const NODE_SIZE = 32

// Generate hexagon points
function getHexagonPoints(cx: number, cy: number, size: number): string {
    const points: string[] = []
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const x = cx + size * Math.cos(angle)
        const y = cy + size * Math.sin(angle)
        points.push(`${x},${y}`)
    }
    return points.join(' ')
}

export function SkillNode({ node, cx, cy, onClick }: SkillNodeProps) {
    const isClickable = node.status !== 'locked'
    const isRoot = node.id === 'root' || node.id === 'trunk'
    const size = isRoot ? NODE_SIZE + 10 : NODE_SIZE

    // Unique IDs for this node
    const glowId = `glow-${node.id}`
    const hexPoints = getHexagonPoints(cx, cy, size)

    // Status-based styling (minimal, monochromatic)
    const getNodeStyle = () => {
        switch (node.status) {
            case 'locked':
                return {
                    stroke: '#3a3a3a',
                    strokeWidth: 1.5,
                    fill: 'rgba(30, 30, 30, 0.8)',
                    glowColor: 'none',
                    textColor: '#ffffff',
                }
            case 'available':
                return {
                    stroke: ACCENT_COLOR,
                    strokeWidth: 1.5,
                    fill: 'rgba(0, 212, 255, 0.05)',
                    glowColor: ACCENT_COLOR,
                    textColor: '#ffffff',
                }
            case 'current':
                return {
                    stroke: ACCENT_COLOR,
                    strokeWidth: 2,
                    fill: 'rgba(0, 212, 255, 0.1)',
                    glowColor: ACCENT_COLOR,
                    textColor: '#ffffff',
                }
            case 'completed':
            case 'mastered':
                return {
                    stroke: ACCENT_COLOR,
                    strokeWidth: 1.5,
                    fill: 'rgba(0, 212, 255, 0.15)',
                    glowColor: ACCENT_COLOR,
                    textColor: '#ffffff',
                }
            default:
                return {
                    stroke: '#3a3a3a',
                    strokeWidth: 1.5,
                    fill: 'rgba(30, 30, 30, 0.8)',
                    glowColor: 'none',
                    textColor: '#ffffff',
                }
        }
    }

    const style = getNodeStyle()

    return (
        <motion.g
            onClick={isClickable ? onClick : undefined}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                delay: isRoot ? 0 : 0.05 + Math.random() * 0.15
            }}
            whileHover={isClickable ? { scale: 1.08 } : undefined}
            whileTap={isClickable ? { scale: 0.95 } : undefined}
        >
            {/* Defs for glow effect */}
            {style.glowColor !== 'none' && (
                <defs>
                    <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feFlood floodColor={style.glowColor} floodOpacity="0.6" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            )}

            {/* Main hexagon - outline style */}
            <polygon
                points={hexPoints}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                filter={style.glowColor !== 'none' ? `url(#${glowId})` : undefined}
            />

            {/* Module icon inside hexagon - show for all except locked */}
            {node.icon && node.status !== 'locked' && (
                <NodeIcon
                    node={node}
                    cx={cx}
                    cy={cy}
                    color={
                        node.status === 'completed' || node.status === 'mastered'
                            ? ACCENT_COLOR  // Bright for completed
                            : node.status === 'available' || node.status === 'current'
                                ? ACCENT_COLOR
                                : '#666'
                    }
                />
            )}

            {/* Inner glow for active states */}
            {(node.status === 'current' || node.status === 'available') && (
                <motion.polygon
                    points={getHexagonPoints(cx, cy, size - 6)}
                    fill="none"
                    stroke={ACCENT_COLOR}
                    strokeWidth="0.5"
                    opacity={0.4}
                    animate={{
                        opacity: node.status === 'current' ? [0.3, 0.6, 0.3] : 0.3,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}

            {/* Impact Ripple Effect - for nodes receiving energy from completed paths */}
            {node.status === 'available' && (
                <>
                    {/* Ripple 1 - expanding ring */}
                    <motion.polygon
                        points={getHexagonPoints(cx, cy, size)}
                        fill="none"
                        stroke={ACCENT_COLOR}
                        strokeWidth="2"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{
                            scale: [1, 1.3, 1.5],
                            opacity: [0.8, 0.4, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2.5,
                            ease: 'easeOut',
                        }}
                        style={{
                            transformOrigin: `${cx}px ${cy}px`,
                            filter: 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.6))'
                        }}
                    />
                    {/* Ripple 2 - delayed second wave */}
                    <motion.polygon
                        points={getHexagonPoints(cx, cy, size)}
                        fill="none"
                        stroke={ACCENT_COLOR}
                        strokeWidth="1.5"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{
                            scale: [1, 1.2, 1.4],
                            opacity: [0.6, 0.3, 0]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            repeatDelay: 2.8,
                            delay: 0.2,
                            ease: 'easeOut',
                        }}
                        style={{
                            transformOrigin: `${cx}px ${cy}px`,
                            filter: 'drop-shadow(0 0 3px rgba(0, 212, 255, 0.4))'
                        }}
                    />
                    {/* Brief flash glow on the node itself */}
                    <motion.polygon
                        points={hexPoints}
                        fill={ACCENT_COLOR}
                        stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.3, 0]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 3.4,
                            ease: 'easeInOut',
                        }}
                    />
                </>
            )}

            {/* Title below node */}
            <text
                x={cx}
                y={cy + size + 16}
                textAnchor="middle"
                fill={style.textColor}
                fontSize="11"
                fontWeight="500"
                style={{ pointerEvents: 'none' }}
            >
                {node.title}
            </text>

            {/* Completed modules now show their icon instead of checkmark */}

            {/* Lock icon for locked nodes - minimal */}
            {node.status === 'locked' && (
                <g opacity={0.3}>
                    <rect
                        x={cx - 4}
                        y={cy}
                        width="8"
                        height="6"
                        rx="1"
                        fill="#333"
                    />
                    <path
                        d={`M ${cx - 2.5} ${cy} v -2 a 2.5 2.5 0 0 1 5 0 v 2`}
                        fill="none"
                        stroke="#333"
                        strokeWidth="1"
                        strokeLinecap="round"
                    />
                </g>
            )}
        </motion.g>
    )
}
