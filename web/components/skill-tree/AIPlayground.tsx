'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Brand Colors
const BRAND = {
    yellow: '#FFFF00',
    yellowHover: '#E6E600',
    yellowMuted: '#CCCC00',
    background: '#121212',
    surface: '#1A1A1A',
    elevated: '#242424',
    textPrimary: '#E0E0E0',
    textSecondary: '#A1A1AA',
    textOnYellow: '#18181B',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
}

interface EvaluationResult {
    passed: boolean
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
    moduleId: string
    followUpQuestion?: string | null
    hint?: string | null
    isInvalid?: boolean
}

interface AIPlaygroundProps {
    moduleId: string
    moduleTitle: string
    onComplete: () => void
    onBack: () => void
}

export function AIPlayground({ moduleId, moduleTitle, onComplete, onBack }: AIPlaygroundProps) {
    const [challenge, setChallenge] = useState<string | null>(null)
    const [userResponse, setUserResponse] = useState('')
    const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showHint, setShowHint] = useState(false)

    // Fetch challenge on mount
    const fetchChallenge = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/ai-mentor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleId, action: 'getChallenge' })
            })
            const data = await res.json()
            setChallenge(data.challenge)
        } catch (error) {
            console.error('Failed to fetch challenge:', error)
        } finally {
            setIsLoading(false)
        }
    }, [moduleId])

    // Initialize on first render
    useEffect(() => {
        fetchChallenge()
    }, [fetchChallenge])

    // Submit for evaluation
    const handleSubmit = async () => {
        if (!userResponse.trim()) return

        setIsLoading(true)
        setEvaluation(null)

        try {
            const res = await fetch('/api/ai-mentor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moduleId,
                    userResponse,
                    action: 'evaluate'
                })
            })

            console.log('API Response status:', res.status)
            const data = await res.json()
            console.log('Evaluation data:', data)

            // Handle error responses
            if (data.error) {
                setEvaluation({
                    passed: false,
                    score: 0,
                    feedback: `Грешка: ${data.error}. ${data.details || ''}`,
                    strengths: [],
                    improvements: ['Опитай отново'],
                    moduleId
                })
            } else {
                setEvaluation(data)
            }

            if (data.passed) {
                // Delay before triggering complete
                setTimeout(() => {
                    onComplete()
                }, 3000)
            }
        } catch (error) {
            console.error('Evaluation failed:', error)
            setEvaluation({
                passed: false,
                score: 0,
                feedback: 'Възникна грешка при връзката със сървъра. Опитай отново.',
                strengths: [],
                improvements: [],
                moduleId
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleRetry = () => {
        setEvaluation(null)
        // Keep userResponse - don't clear it so user can retry with their previous answer
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-playground"
            style={{
                padding: '24px',
                backgroundColor: BRAND.background,
                minHeight: '100%',
                maxHeight: 'calc(100vh - 80px)',
                overflowY: 'auto',
                color: BRAND.textPrimary,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: '1px solid #333',
                        color: '#888',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    ← Обратно
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: BRAND.yellow }}>
                        🎮 AI Playground
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                        Challenge за: {moduleTitle}
                    </p>
                </div>
            </div>

            {/* Challenge Panel */}
            <div style={{
                backgroundColor: '#111',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #222',
            }}>
                <h3 style={{ margin: '0 0 16px', color: BRAND.yellow, fontSize: '16px' }}>
                    📋 Твоята мисия
                </h3>
                {isLoading && !challenge ? (
                    <p style={{ color: '#666' }}>Зареждане...</p>
                ) : (
                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        margin: 0,
                        color: '#ccc',
                        lineHeight: 1.6,
                        fontSize: '14px',
                    }}>
                        {challenge}
                    </pre>
                )}

                {/* Hint Toggle */}
                <div style={{ marginTop: '16px' }}>
                    <button
                        onClick={() => setShowHint(!showHint)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            fontSize: '13px',
                            textDecoration: 'underline',
                        }}
                    >
                        💡 {showHint ? 'Скрий подсказка' : 'Покажи подсказка'}
                    </button>
                    <AnimatePresence>
                        {showHint && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    color: '#888',
                                    fontSize: '13px',
                                    marginTop: '8px',
                                    padding: '12px',
                                    backgroundColor: '#0a0a0a',
                                    borderRadius: '8px',
                                    borderLeft: `3px solid ${BRAND.yellow}`,
                                }}
                            >
                                Прочети внимателно задачата и използвай знанията от модула.
                                Структурирай отговора си ясно и обоснови решенията си.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Response Input */}
            {!evaluation && (
                <div style={{
                    backgroundColor: '#111',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #222',
                }}>
                    <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '16px' }}>
                        ✏️ Твоят отговор
                    </h3>
                    <textarea
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        placeholder="Напиши отговора си тук..."
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '16px',
                            backgroundColor: '#0a0a0a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '14px',
                            resize: 'vertical',
                            lineHeight: 1.6,
                        }}
                    />
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !userResponse.trim()}
                            style={{
                                padding: '12px 32px',
                                backgroundColor: isLoading || !userResponse.trim() ? BRAND.elevated : BRAND.yellow,
                                color: isLoading || !userResponse.trim() ? BRAND.textSecondary : BRAND.textOnYellow,
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: isLoading || !userResponse.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {isLoading ? '⏳ Оценявам...' : '🚀 Изпрати за оценка'}
                        </button>
                    </div>
                </div>
            )}

            {/* Evaluation Result */}
            <AnimatePresence>
                {evaluation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            backgroundColor: evaluation.passed ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 100, 100, 0.1)',
                            borderRadius: '12px',
                            padding: '24px',
                            border: `1px solid ${evaluation.passed ? '#00FF64' : '#FF6464'}`,
                        }}
                    >
                        {/* Result Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '48px' }}>
                                    {evaluation.passed ? '🎉' : '🤔'}
                                </span>
                                <div>
                                    <h3 style={{ margin: 0, color: evaluation.passed ? '#00FF64' : '#FF6464' }}>
                                        {evaluation.passed ? 'Браво! Премина успешно!' : 'Почти! Опитай пак.'}
                                    </h3>
                                    <p style={{ margin: '4px 0 0', color: '#888' }}>
                                        Резултат: {evaluation.score}/100
                                    </p>
                                </div>
                            </div>
                            {evaluation.passed && (
                                <div style={{
                                    padding: '8px 16px',
                                    backgroundColor: BRAND.yellow,
                                    color: BRAND.textOnYellow,
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}>
                                    +50 XP
                                </div>
                            )}
                        </div>

                        {/* Feedback */}
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ color: '#fff', margin: '0 0 8px' }}>📝 Feedback:</h4>
                            <p style={{ color: '#ccc', lineHeight: 1.6 }}>{evaluation.feedback}</p>
                        </div>

                        {/* Strengths */}
                        {evaluation.strengths?.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ color: '#00FF64', margin: '0 0 8px' }}>✅ Добре направено:</h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc' }}>
                                    {evaluation.strengths.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {evaluation.improvements?.length > 0 && !evaluation.passed && (
                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ color: '#FF9944', margin: '0 0 8px' }}>💡 За подобрение:</h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc' }}>
                                    {evaluation.improvements.map((i, idx) => (
                                        <li key={idx}>{i}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Follow-up Question */}
                        {evaluation.followUpQuestion && !evaluation.passed && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '16px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #3B82F6'
                            }}>
                                <h4 style={{ color: '#3B82F6', margin: '0 0 8px' }}>🤔 Помисли върху това:</h4>
                                <p style={{ color: '#ccc', lineHeight: 1.6, margin: 0 }}>{evaluation.followUpQuestion}</p>
                            </div>
                        )}

                        {/* Hint for low scores */}
                        {evaluation.hint && !evaluation.passed && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '16px',
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #A855F7'
                            }}>
                                <h4 style={{ color: '#A855F7', margin: '0 0 8px' }}>💜 Подсказка:</h4>
                                <p style={{ color: '#ccc', lineHeight: 1.6, margin: 0 }}>{evaluation.hint}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                            {evaluation.passed ? (
                                <button
                                    onClick={onComplete}
                                    style={{
                                        padding: '12px 32px',
                                        backgroundColor: BRAND.yellow,
                                        color: BRAND.textOnYellow,
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    🎯 Продължи към следващия модул
                                </button>
                            ) : (
                                <button
                                    onClick={handleRetry}
                                    style={{
                                        padding: '12px 32px',
                                        backgroundColor: '#333',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    🔄 Опитай отново
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
