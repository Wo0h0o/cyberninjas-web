'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Clock, Zap, Gamepad2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { SkillNodeData } from './SkillNode'
import { AIPlayground } from './AIPlayground'
import { RichContent } from './RichContent'
import { MODULE_CONTENT_BG } from './ModuleContentBG'

interface NodeContentProps {
    node: SkillNodeData
    onBack: () => void
    onComplete: () => void
}

// Brand Colors
const BRAND = {
    yellow: '#FFFF00',
    yellowHover: '#E6E600',
    background: '#121212',
    surface: '#1A1A1A',
    elevated: '#242424',
    textOnYellow: '#18181B',
}

// Use Bulgarian content
const MODULE_CONTENT = MODULE_CONTENT_BG

export function NodeContent({ node, onBack, onComplete }: NodeContentProps) {
    const [showPlayground, setShowPlayground] = useState(false)
    const content = MODULE_CONTENT[node.id]

    // Initialize all sections as expanded
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(() => {
        if (!content?.sections) return {}
        return content.sections.reduce((acc, _, index) => ({ ...acc, [index]: true }), {})
    })

    const toggleSection = (index: number) => {
        setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }))
    }

    if (showPlayground) {
        return (
            <AIPlayground
                moduleId={node.id}
                moduleTitle={node.title}
                onComplete={onComplete}
                onBack={() => setShowPlayground(false)}
            />
        )
    }

    return (
        <motion.div
            className="node-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'auto', maxHeight: '100vh' }}
        >
            {/* Header */}
            <div className="node-content-header">
                <motion.button
                    onClick={onBack}
                    className="back-button"
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Обратно към дървото</span>
                </motion.button>
            </div>

            {/* Main content */}
            <motion.div
                className="node-content-main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Title & Subtitle */}
                <h1 className="node-title" style={{ color: BRAND.yellow, fontSize: '2rem' }}>{node.title}</h1>
                <p className="node-subtitle" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{node.subtitle}</p>

                {/* Stats row */}
                <div className="node-stats" style={{ marginBottom: '1.5rem' }}>
                    <div className="node-stat">
                        <Clock className="w-4 h-4" />
                        <span>{content?.duration || '~45 мин'}</span>
                    </div>
                    <div className="node-stat">
                        <BookOpen className="w-4 h-4" />
                        <span>{content?.sections.length || 3} секции</span>
                    </div>
                    <div className="node-stat reward">
                        <Zap className="w-4 h-4" />
                        <span>+{node.xpReward} XP</span>
                    </div>
                </div>

                {/* Intro */}
                {content && (
                    <div style={{
                        padding: '20px 24px',
                        backgroundColor: BRAND.surface,
                        borderRadius: '12px',
                        borderLeft: `4px solid ${BRAND.yellow}`,
                        marginBottom: '28px'
                    }}>
                        <p style={{ margin: 0, color: '#E0E0E0', fontSize: '1rem', lineHeight: 1.8 }}>
                            {content.intro}
                        </p>
                    </div>
                )}

                {/* Sections */}
                {content?.sections.map((section, index) => (
                    <div key={index} style={{
                        backgroundColor: BRAND.surface,
                        borderRadius: '12px',
                        marginBottom: '16px',
                        overflow: 'hidden',
                        border: expandedSections[index] ? `1px solid ${BRAND.yellow}40` : '1px solid #333',
                        borderLeft: expandedSections[index] ? `4px solid ${BRAND.yellow}` : '1px solid #333',
                        transition: 'border-left 0.2s ease',
                    }}>
                        <button
                            onClick={() => toggleSection(index)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '18px 24px',
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: '#fff',
                            }}>{section.title}</span>
                            {expandedSections[index] ? (
                                <ChevronUp className="w-5 h-5" style={{ color: BRAND.yellow }} />
                            ) : (
                                <ChevronDown className="w-5 h-5" style={{ color: '#666' }} />
                            )}
                        </button>
                        {expandedSections[index] && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ padding: '0 24px 24px' }}
                            >
                                <RichContent content={section.content} />
                            </motion.div>
                        )}
                    </div>
                ))}

                {/* Key Takeaways */}
                {content?.keyTakeaways && (
                    <div style={{
                        backgroundColor: `${BRAND.yellow}10`,
                        borderRadius: '12px',
                        padding: '24px',
                        marginTop: '28px',
                        border: `1px solid ${BRAND.yellow}30`
                    }}>
                        <h3 style={{ margin: '0 0 16px', color: BRAND.yellow, fontSize: '1.1rem' }}>
                            🎯 Ключови изводи
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '24px', color: '#E0E0E0' }}>
                            {content.keyTakeaways.map((takeaway, i) => (
                                <li key={i} style={{ marginBottom: '10px', lineHeight: 1.6 }}>{takeaway}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '40px' }}>
                    <motion.button
                        onClick={() => setShowPlayground(true)}
                        className="complete-button"
                        style={{
                            background: `linear-gradient(135deg, ${BRAND.yellow} 0%, ${BRAND.yellowHover} 100%)`,
                            color: BRAND.textOnYellow,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Gamepad2 className="w-5 h-5" />
                        <span>🎮 AI Предизвикателство</span>
                        <span className="xp-badge">+50 XP</span>
                    </motion.button>

                    <motion.button
                        onClick={onComplete}
                        className="complete-button"
                        style={{ background: BRAND.elevated }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Play className="w-5 h-5" />
                        <span>Маркирай като завършен</span>
                        <span className="xp-badge">+{node.xpReward} XP</span>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}
