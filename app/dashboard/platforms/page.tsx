'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Sparkles, Zap, Brain, Video, Mic, Image as ImageIcon, Code, Search } from 'lucide-react'

interface Platform {
    id: string
    name: string
    description: string
    category: 'text' | 'image' | 'video' | 'audio' | 'code' | 'research'
    icon: React.ReactNode
    color: string
    gradient: string
    features: string[]
    url: string
    logo?: string
}

const platforms: Platform[] = [
    {
        id: 'google-ai-studio',
        name: 'Google AI Studio (Gemini)',
        description: 'Най-мощната платформа на Google за работа с AI модели. Предлага достъп до Gemini с огромен context window и multimodal capabilities.',
        category: 'text',
        icon: <Brain className="w-8 h-8" />,
        color: 'purple',
        gradient: 'from-purple-500 to-violet-600',
        features: ['2M tokens context window', 'Multimodal AI', 'Free tier налично', 'Code generation'],
        url: 'https://aistudio.google.com'
    },
    {
        id: 'veo-2',
        name: 'Veo 2 (Google)',
        description: 'Революционен AI модел за генериране на високо-качествено видео съдържание. Създава реалистични видеа от текстови описания.',
        category: 'video',
        icon: <Video className="w-8 h-8" />,
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-600',
        features: ['4K видео качество', 'Реалистични движения', 'Text-to-video', 'Дълги клипове'],
        url: 'https://deepmind.google/technologies/veo/veo-2/'
    },
    {
        id: 'notebooklm',
        name: 'NotebookLM',
        description: 'AI асистент, който превръща вашите документи в интерактивна база знания. Идеален за research и анализ на големи обеми информация.',
        category: 'research',
        icon: <Search className="w-8 h-8" />,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
        features: ['Document analysis', 'Audio overview', 'Source citations', 'Multimodal input'],
        url: 'https://notebooklm.google.com'
    },
    {
        id: 'chatgpt',
        name: 'ChatGPT (OpenAI)',
        description: 'Най-популярният AI чатбот в света. GPT-4 предлага изключителни capabilities за разговор, анализ и генериране на съдържание.',
        category: 'text',
        icon: <Sparkles className="w-8 h-8" />,
        color: 'green',
        gradient: 'from-green-500 to-emerald-600',
        features: ['GPT-4o модел', 'DALL-E 3 интеграция', 'Web browsing', 'Custom GPTs'],
        url: 'https://chat.openai.com'
    },
    {
        id: 'midjourney',
        name: 'Midjourney',
        description: 'Водещата платформа за AI генериране на изображения. Създава невероятно артистични и детайлни визуализации.',
        category: 'image',
        icon: <ImageIcon className="w-8 h-8" />,
        color: 'pink',
        gradient: 'from-pink-500 to-rose-600',
        features: ['Photorealistic images', 'Artistic styles', 'High resolution', 'Community gallery'],
        url: 'https://midjourney.com'
    },
    {
        id: 'claude',
        name: 'Claude (Anthropic)',
        description: 'AI асистент с фокус върху безопасност и дълги контексти. Отличен за писане, анализ и complex reasoning.',
        category: 'text',
        icon: <Brain className="w-8 h-8" />,
        color: 'orange',
        gradient: 'from-orange-500 to-amber-600',
        features: ['200K context window', 'Constitutional AI', 'PDF analysis', 'Advanced reasoning'],
        url: 'https://claude.ai'
    },
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'Най-добрата платформа за AI voice generation. Създава изключително реалистични гласове на различни езици.',
        category: 'audio',
        icon: <Mic className="w-8 h-8" />,
        color: 'indigo',
        gradient: 'from-indigo-500 to-purple-600',
        features: ['Multilingual voices', 'Voice cloning', 'Emotional range', 'High quality audio'],
        url: 'https://elevenlabs.io'
    },
    {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        description: 'AI програмист, който ти помага да пишеш код по-бързо и по-ефективно. Интегриран директно във VS Code.',
        category: 'code',
        icon: <Code className="w-8 h-8" />,
        color: 'gray',
        gradient: 'from-gray-500 to-slate-600',
        features: ['Code completion', 'Multiple languages', 'Context-aware', 'IDE integration'],
        url: 'https://github.com/features/copilot'
    },
    {
        id: 'runway',
        name: 'Runway ML',
        description: 'Креативна платформа за AI видео editing и генериране. Предлага advanced tools за visual effects и видео manipulation.',
        category: 'video',
        icon: <Zap className="w-8 h-8" />,
        color: 'fuchsia',
        gradient: 'from-fuchsia-500 to-pink-600',
        features: ['Video editing', 'Motion tracking', 'Green screen', 'Style transfer'],
        url: 'https://runwayml.com'
    },
    {
        id: 'perplexity',
        name: 'Perplexity AI',
        description: 'AI търсачка с real-time интернет достъп. Предоставя точни отговори със citations и источник verification.',
        category: 'research',
        icon: <Search className="w-8 h-8" />,
        color: 'cyan',
        gradient: 'from-cyan-500 to-blue-600',
        features: ['Real-time web search', 'Source citations', 'Pro search mode', 'Academic papers'],
        url: 'https://perplexity.ai'
    }
]

const categories = [
    { id: 'all', label: 'Всички', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'text', label: 'Текст', icon: <Brain className="w-4 h-4" /> },
    { id: 'image', label: 'Изображения', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'video', label: 'Видео', icon: <Video className="w-4 h-4" /> },
    { id: 'audio', label: 'Аудио', icon: <Mic className="w-4 h-4" /> },
    { id: 'code', label: 'Код', icon: <Code className="w-4 h-4" /> },
    { id: 'research', label: 'Research', icon: <Search className="w-4 h-4" /> },
]

export default function PlatformsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)

    const filteredPlatforms = selectedCategory === 'all'
        ? platforms
        : platforms.filter(p => p.category === selectedCategory)

    return (
        <div className="min-h-screen py-8 px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="w-10 h-10 text-purple-400" />
                    <h1 className="text-4xl md:text-5xl font-bold">
                        AI <span className="gradient-text">Платформи</span>
                    </h1>
                </div>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Открий най-добрите AI инструменти и платформи за твоите проекти
                </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap justify-center gap-3 mb-12"
            >
                {categories.map((category) => (
                    <motion.button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl
                            transition-all duration-300 border
                            ${selectedCategory === category.id
                                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                            }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {category.icon}
                        <span className="font-medium">{category.label}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Platforms Grid */}
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredPlatforms.map((platform, index) => (
                            <motion.div
                                key={platform.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onHoverStart={() => setHoveredPlatform(platform.id)}
                                onHoverEnd={() => setHoveredPlatform(null)}
                                className="group relative h-full"
                            >
                                {/* Glow Effect */}
                                <div className={`
                                    absolute -inset-1 bg-gradient-to-br ${platform.gradient} 
                                    rounded-2xl blur-xl opacity-0 group-hover:opacity-30 
                                    transition-opacity duration-500
                                `} />

                                {/* Card */}
                                <div className="relative h-full bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300">
                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Icon & Title */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <motion.div
                                                className={`
                                                    p-3 rounded-xl bg-gradient-to-br ${platform.gradient}
                                                    text-white
                                                `}
                                                animate={{
                                                    rotate: hoveredPlatform === platform.id ? [0, -10, 10, 0] : 0,
                                                }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                {platform.icon}
                                            </motion.div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">
                                                    {platform.name}
                                                </h3>
                                                <div className={`
                                                    text-xs font-medium px-3 py-1 rounded-full 
                                                    bg-${platform.color}-500/20 text-${platform.color}-400
                                                    border border-${platform.color}-500/30
                                                    inline-block
                                                `}>
                                                    {categories.find(c => c.id === platform.category)?.label}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                            {platform.description}
                                        </p>

                                        {/* Features */}
                                        <div className="space-y-2 mb-6">
                                            {platform.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${platform.gradient}`} />
                                                    <span className="text-gray-300">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        <motion.a
                                            href={platform.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`
                                                flex items-center justify-center gap-2 w-full
                                                py-3 px-4 rounded-xl
                                                bg-gradient-to-r ${platform.gradient}
                                                text-white font-medium
                                                transition-all duration-300
                                                group-hover:shadow-lg group-hover:shadow-${platform.color}-500/50
                                            `}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span>Посети платформата</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </motion.a>
                                    </div>

                                    {/* Animated background pattern */}
                                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                                        <motion.div
                                            animate={{
                                                rotate: 360,
                                            }}
                                            transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        >
                                            {platform.icon}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* No results */}
                {filteredPlatforms.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <p className="text-gray-500 text-lg">
                            Няма намерени платформи в тази категория
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
