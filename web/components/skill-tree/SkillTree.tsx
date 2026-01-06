'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkillNode, SkillNodeData } from './SkillNode'
import { SkillPath } from './SkillPath'
import { TreeControls } from './TreeControls'
import { NodeContent } from './NodeContent'
import {
    Brain,           // Science - AI thinking/hallucinations
    Cpu,             // Technology - tools/systems  
    MessageSquareCode, // Engineering - prompting
    Palette,         // Arts - creativity
    Target           // Mindset - strategy/goals
} from 'lucide-react'

// 5 Core STEAM-AI Modules - Vertical Tree (grows upward)
const STEAM_MODULES: SkillNodeData[] = [
    // === MODULE 1: SCIENCE (Bottom - Start) ===
    {
        id: 'science',
        title: 'Анатомия на Илюзията',
        subtitle: 'SCIENCE: Логика & Психология',
        type: 'milestone',
        status: 'completed',
        position: { x: 0, y: 200 },
        xpReward: 150,
        icon: Brain,
    },

    // === MODULE 2: TECHNOLOGY ===
    {
        id: 'technology',
        title: 'Екзоскелет за Интелекта',
        subtitle: 'TECHNOLOGY: Инструменти & Власт',
        type: 'milestone',
        status: 'available',
        position: { x: 0, y: 80 },
        xpReward: 200,
        prerequisites: ['science'],
        icon: Cpu,
    },

    // === MODULE 3: ENGINEERING ===
    {
        id: 'engineering',
        title: 'Лингвистична Алхимия',
        subtitle: 'ENGINEERING: Промптинг & Системи',
        type: 'milestone',
        status: 'locked',
        position: { x: 0, y: -40 },
        xpReward: 300,
        prerequisites: ['technology'],
        icon: MessageSquareCode,
    },

    // === MODULE 4: ARTS ===
    {
        id: 'arts',
        title: 'Синтетичен Ренесанс',
        subtitle: 'ARTS: Етика, Вкус & Човечност',
        type: 'milestone',
        status: 'locked',
        position: { x: 0, y: -160 },
        xpReward: 250,
        prerequisites: ['engineering'],
        icon: Palette,
    },

    // === MODULE 5: MINDSET (Top - Final) ===
    {
        id: 'mindset',
        title: '4D Шах с Бъдещето',
        subtitle: 'MINDSET: Стратегия & Бъдеще',
        type: 'milestone',
        status: 'locked',
        position: { x: 0, y: -280 },
        xpReward: 350,
        prerequisites: ['arts'],
        icon: Target,
    },
]

// Generate connections based on prerequisites
const CONNECTIONS = STEAM_MODULES
    .filter(node => node.prerequisites?.length)
    .flatMap(node =>
        node.prerequisites!.map((prereq: string) => ({
            from: prereq,
            to: node.id,
        }))
    )

interface SkillTreeProps {
    onNodeSelect?: (nodeId: string) => void
}

export function SkillTree({ onNodeSelect }: SkillTreeProps) {
    const [nodes, setNodes] = useState<SkillNodeData[]>(STEAM_MODULES)
    const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null)
    const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const outerContainerRef = useRef<HTMLDivElement>(null)

    const centerX = 450
    const centerY = 350

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setViewState(prev => ({
                    ...prev,
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                }))
            }
        }

        const handleGlobalMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove)
            window.addEventListener('mouseup', handleGlobalMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove)
            window.removeEventListener('mouseup', handleGlobalMouseUp)
        }
    }, [isDragging, dragStart])

    useEffect(() => {
        const container = outerContainerRef.current
        if (!container) return

        const handleWheelEvent = (e: WheelEvent) => {
            if (selectedNode) return
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setViewState(prev => ({
                ...prev,
                scale: Math.min(2, Math.max(0.5, prev.scale + delta))
            }))
        }

        container.addEventListener('wheel', handleWheelEvent, { passive: false })
        return () => container.removeEventListener('wheel', handleWheelEvent)
    }, [selectedNode])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) {
            e.preventDefault()
            setIsDragging(true)
            setDragStart({ x: e.clientX - viewState.x, y: e.clientY - viewState.y })
        }
    }, [viewState.x, viewState.y])

    const handleNodeClick = useCallback((node: SkillNodeData) => {
        if (node.status === 'locked') return
        setSelectedNode(node)
        onNodeSelect?.(node.id)
    }, [onNodeSelect])

    const handleNodeComplete = useCallback((nodeId: string) => {
        setNodes(prev => {
            const newNodes = prev.map(n => {
                if (n.id === nodeId) {
                    return { ...n, status: 'completed' as const }
                }
                if (n.status === 'locked' && n.prerequisites) {
                    const allPrereqsComplete = n.prerequisites.every((prereq: string) => {
                        const prereqNode = prev.find(p => p.id === prereq)
                        return prereqNode?.status === 'completed' || prereq === nodeId
                    })
                    if (allPrereqsComplete) {
                        return { ...n, status: 'available' as const }
                    }
                }
                return n
            })
            return newNodes
        })
        setSelectedNode(null)
    }, [])

    const handleBack = useCallback(() => {
        setSelectedNode(null)
    }, [])

    const handleReset = useCallback(() => {
        setViewState({ x: 0, y: 0, scale: 1 })
    }, [])

    return (
        <div ref={outerContainerRef} className="skill-tree-container">
            <AnimatePresence mode="wait">
                {selectedNode ? (
                    <NodeContent
                        key="content"
                        node={selectedNode}
                        onBack={handleBack}
                        onComplete={() => handleNodeComplete(selectedNode.id)}
                    />
                ) : (
                    <motion.div
                        key="tree"
                        ref={containerRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="skill-tree-viewport"
                        onMouseDown={handleMouseDown}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab', overflow: 'hidden' }}
                    >
                        <TreeControls
                            scale={viewState.scale}
                            onZoomIn={() => setViewState(prev => ({ ...prev, scale: Math.min(2, prev.scale + 0.2) }))}
                            onZoomOut={() => setViewState(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.2) }))}
                            onReset={handleReset}
                        />

                        <div
                            className="skill-tree-transform-wrapper"
                            style={{
                                transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`,
                                transformOrigin: 'center center',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            <svg
                                width="900"
                                height="700"
                                viewBox="0 0 900 700"
                                className="skill-tree-svg"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <defs>
                                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Connection paths */}
                                {CONNECTIONS.map(conn => {
                                    const fromNode = nodes.find(n => n.id === conn.from)
                                    const toNode = nodes.find(n => n.id === conn.to)
                                    if (!fromNode || !toNode) return null

                                    return (
                                        <SkillPath
                                            key={`${conn.from}-${conn.to}`}
                                            from={{
                                                x: centerX + fromNode.position.x,
                                                y: centerY + fromNode.position.y
                                            }}
                                            to={{
                                                x: centerX + toNode.position.x,
                                                y: centerY + toNode.position.y
                                            }}
                                            isActive={fromNode.status === 'completed' || fromNode.status === 'current'}
                                            isCompleted={fromNode.status === 'completed'}
                                        />
                                    )
                                })}

                                {/* Skill nodes */}
                                {nodes.map(node => (
                                    <SkillNode
                                        key={node.id}
                                        node={node}
                                        cx={centerX + node.position.x}
                                        cy={centerY + node.position.y}
                                        onClick={() => handleNodeClick(node)}
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* Hint */}
                        <div className="skill-tree-hint">
                            Влачи • Scroll за zoom
                        </div>

                        {/* Legend */}
                        <div className="skill-tree-legend">
                            <div className="legend-item">
                                <div className="legend-dot available" />
                                <span>Достъпен</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot completed" />
                                <span>Завършен</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot locked" />
                                <span>Заключен</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
