import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Clock, Target, ArrowRight } from 'lucide-react'
import { ProgressCircle } from './ProgressCircle'
import { FeatureChoiceCard } from './FeatureChoiceCard'

interface UserProfile {
    name?: string
    hasStartedCourse?: boolean
}

interface CurrentLesson {
    title: string
    courseTitle: string
    courseSlug: string
    lessonSlug: string
    duration: number
    progress?: number
}

type HeroVariant = 'first-time-choice' | 'returning'

interface HeroActionCardProps {
    variant: HeroVariant
    user: UserProfile
    currentLesson?: CurrentLesson
    overallProgress?: number
    stats?: {
        completedLessons: number
        totalLessons: number
        streak: number
    }
}

export function HeroActionCard({
    variant,
    user,
    currentLesson,
    overallProgress = 0,
    stats
}: HeroActionCardProps) {

    // FIRST-TIME: 4 equal choices
    if (variant === 'first-time-choice') {
        return (
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="hero-action-card"
                role="main"
                aria-label="Choose your starting point"
            >
                <div className="px-6 py-8 md:px-10 md:py-12">
                    {/* Welcome message */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            Добре дошъл, {user.name?.split(' ')[0] || 'там'}!
                        </h1>
                        <p className="text-base text-gray-300 max-w-2xl mx-auto">
                            Избери откъде искаш да започнеш своето AI пътуване
                        </p>
                    </div>

                    {/* 4 equal-weight feature choices */}
                    <div className="choice-grid">
                        <FeatureChoiceCard
                            href="/dashboard/courses"
                            icon="GraduationCap"
                            label="Академия"
                            description="Видео курсове за AI майсторство"
                            badge="paid"
                            featureArea="courses"
                            index={0}
                        />

                        <FeatureChoiceCard
                            href="/dashboard/prompts"
                            icon="Sparkles"
                            label="AI Команди"
                            description="150+ готови промпта за ChatGPT"
                            badge="free"
                            featureArea="prompts"
                            index={1}
                        />

                        <FeatureChoiceCard
                            href="/dashboard/guides"
                            icon="BookOpen"
                            label="Ръководства"
                            description="Step-by-step AI guides"
                            badge="free"
                            featureArea="guides"
                            index={2}
                        />

                        <FeatureChoiceCard
                            href="/dashboard/resources"
                            icon="FolderOpen"
                            label="Ресурси"
                            description="Templates & полезни инструменти"
                            badge="free"
                            featureArea="resources"
                            index={3}
                        />
                    </div>

                    {/* Subtle hint */}
                    <p className="text-center text-sm text-gray-500 mt-8">
                        Не се притеснявай - можеш да изследваш всички секции по всяко време
                    </p>
                </div>
            </motion.section>
        )
    }

    // RETURNING USER: Focus + Context layout
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-action-card returning"
            role="main"
            aria-label="Continue your learning"
        >
            <div className="grid lg:grid-cols-[60%_40%] gap-8 p-8 md:p-12">
                {/* LEFT: Focus Area - Current Action */}
                <div className="focus-area">
                    <p className="eyebrow">Продължи откъдето спря</p>

                    <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">
                            {currentLesson?.courseTitle}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            {currentLesson?.title}
                        </h2>
                    </div>

                    {/* Single primary CTA */}
                    <Link
                        href={`/dashboard/courses/${currentLesson?.courseSlug}/${currentLesson?.lessonSlug}`}
                        className="primary-cta group inline-flex"
                        autoFocus
                    >
                        <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                        <span>Продължи урока</span>
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Micro-context */}
                    <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{currentLesson?.duration} мин</span>
                        </div>
                        {currentLesson?.progress && (
                            <div className="flex items-center gap-2">
                                <span>•</span>
                                <span>{currentLesson.progress}% завършен</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Context Area - Overall Progress (Read-only) */}
                <div className="context-sidebar">
                    <div className="flex flex-col items-center justify-center h-full">
                        {/* Circular progress - ONLY for visual context */}
                        <div className="relative mb-6">
                            <ProgressCircle
                                percentage={overallProgress}
                                size={140}
                                strokeWidth={10}
                                showLabel={false}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {overallProgress}%
                                </span>
                                <span className="text-xs text-gray-500 mt-1">общ напредък</span>
                            </div>
                        </div>

                        {/* Mini stats - muted, non-interactive */}
                        <div className="space-y-3 w-full">
                            <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-white/[0.02]">
                                <span className="text-sm text-gray-400">Завършени</span>
                                <span className="text-lg font-semibold text-white">
                                    {stats?.completedLessons}/{stats?.totalLessons}
                                </span>
                            </div>

                            {stats?.streak && stats.streak > 0 && (
                                <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-white/[0.02]">
                                    <span className="text-sm text-gray-400">Streak</span>
                                    <span className="text-lg font-semibold text-amber-400">
                                        {stats.streak} дни 🔥
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}
