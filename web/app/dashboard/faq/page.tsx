'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Zap, Lock, CreditCard, BookOpen, Users, Sparkles } from 'lucide-react'

interface FAQ {
    id: string
    question: string
    answer: string
    category: 'general' | 'subscription' | 'platform' | 'learning'
    icon: React.ReactNode
}

const faqs: FAQ[] = [
    {
        id: '1',
        question: 'Какво е CyberNinjas платформата?',
        answer: 'CyberNinjas е най-голямата образователна платформа за AI в България. Предлагаме обширна библиотека от промпти, видео курсове, безплатни ресурси и практически инструменти за овладяване на изкуствения интелект. Нашата цел е да направим AI достъпен за всички - от начинаещи до експерти.',
        category: 'general',
        icon: <Sparkles className="w-5 h-5" />
    },
    {
        id: '2',
        question: 'Как да започна с платформата?',
        answer: 'Започването е лесно! Регистрирайте се за безплатен акаунт, разгледайте нашите безплатни ресурси и курсове за начинаещи. Можете да започнете с раздела "Ресурси", където ще намерите терминология и основни концепции за AI. След това преминете към практическите промпти и курсове.',
        category: 'general',
        icon: <Zap className="w-5 h-5" />
    },
    {
        id: '3',
        question: 'Каква е разликата между безплатния и платения план?',
        answer: 'Безплатният план ви дава достъп до основни ресурси, въведение в курсовете и ограничен брой промпти. Pro планът отключва пълния достъп до всички премиум промпти, всички видео курсове, приоритетна поддръжка, ранен достъп до нови функции и специализирани инструменти за автоматизация.',
        category: 'subscription',
        icon: <CreditCard className="w-5 h-5" />
    },
    {
        id: '4',
        question: 'Какво включват вашите курсове?',
        answer: 'Нашите курсове покриват широк спектър от теми - от основи на AI и prompt engineering до напреднали техники за автоматизация. Всеки курс включва видео лекции, практически упражнения, готови промпти и реални case studies. Курсовете са разделени на модули за по-лесно усвояване на материала.',
        category: 'learning',
        icon: <BookOpen className="w-5 h-5" />
    },
    {
        id: '5',
        question: 'С какви AI платформи мога да работя?',
        answer: 'Нашите промпти и обучения са съвместими с всички популярни AI платформи - ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Midjourney, DALL-E, Perplexity и много други. В раздела "Платформи" ще намерите подробни описания и препоръки за всяка една от тях.',
        category: 'platform',
        icon: <Users className="w-5 h-5" />
    },
    {
        id: '6',
        question: 'Безопасни ли са моите данни?',
        answer: 'Абсолютно! Използваме най-модерните security практики и криптиране. Вашите лични данни са защитени с SSL encryption, а плащанията се обработват през сигурни payment gateway като Stripe. Никога не споделяме вашата информация с трети страни без ваше разрешение.',
        category: 'general',
        icon: <Lock className="w-5 h-5" />
    },
    {
        id: '7',
        question: 'Мога ли да анулирам абонамента си по всяко време?',
        answer: 'Да, можете да анулирате абонамента си по всяко време от настройките на профила си. Няма скрити такси или договори. При анулиране, ще имате достъп до Pro функциите до края на текущия платен период.',
        category: 'subscription',
        icon: <CreditCard className="w-5 h-5" />
    },
    {
        id: '8',
        question: 'Предлагате ли корпоративни решения?',
        answer: 'Да! Имаме специални enterprise планове за компании и екипи. Те включват допълнителни функции като team management, custom промпти library, dedicated support и персонализирани обучения. Свържете се с нас на team@cyberninjas.net за оферта.',
        category: 'subscription',
        icon: <Users className="w-5 h-5" />
    },
    {
        id: '9',
        question: 'Как се обновява съдържанието?',
        answer: 'Нашата библиотека се обновява постоянно! Добавяме нови промпти, курсови материали и ресурси всяка седмица. AI технологиите се развиват бързо и ние сме винаги в крак с най-новите тенденции. Pro членовете получават ранен достъп до новото съдържание.',
        category: 'learning',
        icon: <Sparkles className="w-5 h-5" />
    },
    {
        id: '10',
        question: 'Мога ли да използвам промптите за комерсиални цели?',
        answer: 'Да, всички наши промпти са лицензирани за комерсиална употреба от нашите платени членове. Можете свободно да ги използвате в бизнес проектите си, с клиенти или за вътрешна автоматизация на процеси.',
        category: 'platform',
        icon: <Zap className="w-5 h-5" />
    },
    {
        id: '11',
        question: 'Имате ли поддръжка на български език?',
        answer: 'Да! Цялата наша платформа, курсове и промпти са на български език. Поддръжката ни също е на български и можете да се свържете с нас по email или чрез контактната форма. Отговаряме обикновено в рамките на 24 часа.',
        category: 'general',
        icon: <HelpCircle className="w-5 h-5" />
    },
    {
        id: '12',
        question: 'Подходяща ли е платформата за начинаещи?',
        answer: 'Абсолютно! Платформата е дизайнирана да бъде достъпна за всички нива на опит. Започваме с основните концепции в раздела "Ресурси", предлагаме стъпка-по-стъпка обучения и имаме голяма колекция от готови за употреба промпти. Дори ако никога не сте работили с AI, ще можете да започнете веднага.',
        category: 'learning',
        icon: <BookOpen className="w-5 h-5" />
    }
]

const categories = [
    { id: 'all', label: 'Всички', color: 'purple' },
    { id: 'general', label: 'Общи', color: 'blue' },
    { id: 'subscription', label: 'Абонамент', color: 'green' },
    { id: 'platform', label: 'Платформа', color: 'orange' },
    { id: 'learning', label: 'Обучение', color: 'pink' }
]

export default function FAQPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [openFAQ, setOpenFAQ] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
        const matchesSearch = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const toggleFAQ = (id: string) => {
        setOpenFAQ(openFAQ === id ? null : id)
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
                    <HelpCircle className="w-10 h-10 text-accent-yellow" />
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Често Задавани <span className="gradient-text">Въпроси</span>
                    </h1>
                </div>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Намери отговори на най-популярните въпроси за платформата
                </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Търси въпрос..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-yellow/50 transition-all duration-300"
                        />
                        <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((category) => (
                        <motion.button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`
                                px-5 py-2.5 rounded-xl font-medium
                                transition-all duration-300 border
                                ${selectedCategory === category.id
                                    ? `bg-${category.color}-500/20 border-${category.color}-500/50 text-white`
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                }
                            `}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {category.label}
                        </motion.button>
                    ))}
                </motion.div>

                {/* FAQ List */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory + searchQuery}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        {filteredFAQs.map((faq, index) => {
                            const isOpen = openFAQ === faq.id
                            const category = categories.find(c => c.id === faq.category)

                            return (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {/* FAQ Card */}
                                    <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-accent-yellow/10">
                                        {/* Question */}
                                        <button
                                            onClick={() => toggleFAQ(faq.id)}
                                            className="w-full p-6 flex items-center gap-4 text-left transition-all duration-300"
                                        >
                                            {/* Icon */}
                                            <motion.div
                                                animate={{
                                                    rotate: isOpen ? 360 : 0,
                                                    scale: isOpen ? 1.1 : 1
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className={`
                                                    p-3 rounded-xl bg-gradient-to-br from-${category?.color}-500 to-amber-600
                                                    text-white flex-shrink-0
                                                `}
                                            >
                                                {faq.icon}
                                            </motion.div>

                                            {/* Question text */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                                                    {faq.question}
                                                </h3>
                                            </div>

                                            {/* Chevron */}
                                            <motion.div
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-accent-yellow transition-colors duration-300" />
                                            </motion.div>
                                        </button>

                                        {/* Answer */}
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 pt-2 border-t border-white/5">
                                                        <div className="pl-16">
                                                            <p className="text-gray-300 leading-relaxed">
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Animated gradient line */}
                                        {isOpen && (
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                exit={{ scaleX: 0 }}
                                                className={`h-1 bg-gradient-to-r from-${category?.color}-500 to-accent-yellow`}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}

                        {/* No results */}
                        {filteredFAQs.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    Няма намерени въпроси
                                </p>
                                <p className="text-gray-600 text-sm mt-2">
                                    Опитай с различна категория или търсене
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Contact CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-accent-yellow/10 to-amber-500/10 border border-accent-yellow/20 text-center"
                >
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Не намери отговор на въпроса си?
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Нашият екип е винаги готов да помогне!
                    </p>
                    <motion.a
                        href="mailto:support@cyberninjas.net"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-yellow to-accent-yellow-hover text-text-on-yellow font-medium hover:shadow-lg hover:shadow-accent-yellow/50 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <HelpCircle className="w-5 h-5" />
                        Свържи се с нас
                    </motion.a>
                </motion.div>
            </div>
        </div>
    )
}
