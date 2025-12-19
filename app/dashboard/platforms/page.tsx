'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Sparkles, Zap, Brain, Video, Mic, Image as ImageIcon, Code, Search, Bot, Terminal, Cpu, FileText, Network, Workflow, Scissors, PenTool, MessageSquare, Monitor, LayoutGrid, LayoutList, Globe, Puzzle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useUserLevel } from '@/hooks/useUserLevel'

// Map icon string names to React components
const iconMap: Record<string, any> = {
    'Brain': Brain,
    'Video': Video,
    'Mic': Mic,
    'Image': ImageIcon,
    'Code': Code,
    'Search': Search,
    'Zap': Zap,
    'Sparkles': Sparkles,
    'Bot': Bot,
    'Terminal': Terminal,
    'Cpu': Cpu,
    'FileText': FileText,
    'Network': Network,
    'Workflow': Workflow,
    'Scissors': Scissors,
    'PenTool': PenTool,
    'MessageSquare': MessageSquare,
    'Github': Code, // Reuse Code for Github
    'UserSquare2': Video, // Reuse Video for Avatar
    'Music': Mic, // Reuse Mic for Music
    'BookOpen': FileText // Reuse FileText for Notebook
}

interface Platform {
    id: string
    name: string
    description: string
    category: string // text, image, video, audio, code, research, automation, productivity
    type: 'website' | 'software' | 'extension'
    icon: string
    logo_url?: string // Clearbit Logo API URL
    url: string
    features: string[]
    is_featured: boolean
    color?: string
}

const categories = [
    { id: 'all', label: 'Всички', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'text', label: 'Текст', icon: <Brain className="w-4 h-4" /> },
    { id: 'image', label: 'Изображения', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'video', label: 'Видео', icon: <Video className="w-4 h-4" /> },
    { id: 'audio', label: 'Аудио', icon: <Mic className="w-4 h-4" /> },
    { id: 'code', label: 'Код', icon: <Code className="w-4 h-4" /> },
    { id: 'research', label: 'Research', icon: <Search className="w-4 h-4" /> },
    { id: 'productivity', label: 'Продуктивност', icon: <Zap className="w-4 h-4" /> },
]

export default function PlatformsPage() {
    const { user } = useAuth()
    const { addXP } = useUserLevel()
    const [selectedType, setSelectedType] = useState<'website' | 'software' | 'extension'>('website')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [platforms, setPlatforms] = useState<Platform[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)

    useEffect(() => {
        fetchPlatforms()
    }, [])

    const fetchPlatforms = async () => {
        try {
            const { data, error } = await supabase
                .from('platforms')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true })

            if (error) throw error
            if (data) setPlatforms(data as Platform[])
        } catch (error) {
            console.error('Error fetching platforms:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredPlatforms = platforms.filter(platform => {
        const matchesType = platform.type === selectedType
        const matchesCategory = selectedCategory === 'all' || platform.category === selectedCategory
        return matchesType && matchesCategory
    })

    const getGradient = (category: string) => {
        switch (category) {
            case 'text': return 'from-purple-500 to-violet-600'
            case 'image': return 'from-pink-500 to-rose-600'
            case 'video': return 'from-blue-500 to-cyan-600'
            case 'audio': return 'from-indigo-500 to-purple-600'
            case 'code': return 'from-gray-500 to-slate-600'
            case 'research': return 'from-emerald-500 to-teal-600'
            case 'productivity': return 'from-orange-500 to-amber-600'
            case 'automation': return 'from-red-500 to-orange-600'
            default: return 'from-gray-500 to-slate-600'
        }
    }

    const getColor = (category: string) => {
        switch (category) {
            case 'text': return 'purple'
            case 'image': return 'pink'
            case 'video': return 'blue'
            case 'audio': return 'indigo'
            case 'code': return 'gray'
            case 'research': return 'emerald'
            case 'productivity': return 'orange'
            case 'automation': return 'red'
            default: return 'gray'
        }
    }

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
                    Цялата екосистема от инструменти, разделени на категории
                </p>
            </motion.div>

            {/* Main Tabs (Type) */}
            <div className="flex justify-center mb-10">
                <div className="bg-white/5 p-1.5 rounded-2xl inline-flex">
                    {[
                        { id: 'website', label: 'Websites', icon: <Globe className="w-4 h-4" /> },
                        { id: 'software', label: 'Software', icon: <Monitor className="w-4 h-4" /> },
                        { id: 'extension', label: 'Extensions', icon: <Puzzle className="w-4 h-4" /> }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedType(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300
                                ${selectedType === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

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
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                            transition-all duration-300 border
                            ${selectedCategory === category.id
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
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
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedType + selectedCategory}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredPlatforms.map((platform, index) => {
                                const IconComponent = iconMap[platform.icon] || Sparkles
                                const gradient = getGradient(platform.category)
                                const color = getColor(platform.category)

                                return (
                                    <motion.div
                                        key={platform.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onHoverStart={() => setHoveredPlatform(platform.id)}
                                        onHoverEnd={() => setHoveredPlatform(null)}
                                        className="group relative h-full"
                                    >
                                        {/* Glow Effect */}
                                        <div className={`
                                            absolute -inset-1 bg-gradient-to-br ${gradient} 
                                            rounded-2xl blur-xl opacity-0 group-hover:opacity-30 
                                            transition-opacity duration-500
                                        `} />

                                        {/* Card */}
                                        <div className="relative h-full flex flex-col bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300">
                                            {/* Featured Badge */}
                                            {platform.is_featured && (
                                                <div className="absolute top-0 right-0 p-3">
                                                    <div className="bg-yellow-500/20 text-yellow-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-yellow-500/30">
                                                        Featured
                                                    </div>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="p-6 flex-1 flex flex-col">
                                                {/* Logo & Title */}
                                                <div className="flex items-start gap-4 mb-4">
                                                    <motion.div
                                                        className={`
                                                            p-4 rounded-xl bg-gradient-to-br ${gradient}
                                                            text-white flex items-center justify-center
                                                        `}
                                                        animate={{
                                                            rotate: hoveredPlatform === platform.id ? [0, -10, 10, 0] : 0,
                                                        }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        {platform.logo_url ? (
                                                            <img
                                                                src={platform.logo_url}
                                                                alt={platform.name}
                                                                className="w-12 h-12 object-contain"
                                                                onError={(e) => {
                                                                    // Fallback to icon if logo fails
                                                                    e.currentTarget.style.display = 'none';
                                                                    const iconElement = e.currentTarget.nextElementSibling;
                                                                    if (iconElement) iconElement.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        <IconComponent className={`w-12 h-12 ${platform.logo_url ? 'hidden' : ''}`} />
                                                    </motion.div>
                                                    <div className="flex-1 pr-6">
                                                        <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                                                            {platform.name}
                                                        </h3>
                                                        <div className={`
                                                            text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full 
                                                            bg-${color}-500/10 text-${color}-400
                                                            border border-${color}-500/20
                                                            inline-block
                                                        `}>
                                                            {platform.category}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                                                    {platform.description}
                                                </p>

                                                {/* Features */}
                                                <div className="space-y-2 mb-6 border-t border-white/5 pt-4">
                                                    {platform.features?.slice(0, 3).map((feature, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                                            <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${gradient}`} />
                                                            <span className="text-gray-500 group-hover:text-gray-300 transition-colors">
                                                                {feature}
                                                            </span>
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
                                                        py-2.5 px-4 rounded-xl
                                                        bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20
                                                        text-gray-300 hover:text-white font-medium
                                                        transition-all duration-300
                                                        mt-auto
                                                    `}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span>Посети</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </motion.a>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* No results */}
                {!isLoading && filteredPlatforms.length === 0 && (
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
