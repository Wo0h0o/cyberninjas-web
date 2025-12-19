"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";

interface PromptOption {
    id: string;
    category: string;
    title: string;
    prompt: string;
}

const SAMPLE_PROMPTS: PromptOption[] = [
    {
        id: "strategist",
        category: "Бизнес Стратегия",
        title: "Business Strategist",
        prompt: `ДЕЙСТВАЙ КАТО: Старши Бизнес Стратег с 15+ години опит в мащабиране на стартъпи.

КОНТЕКСТ: Управлявам [ОПИШИ БИЗНЕСА СИ]. Моята целева аудитория е [ОПИШИ ICP]. Моето конкурентно предимство е [ТВОЕТО УНИКАЛНО ПРЕДИМСТВО].

ЦЕЛ: Анализирай моя бизнес модел и предложи 3 възможности с висок ROI, които даследвам следващото тримесечие.

ОГРАНИЧЕНИЯ:
- Фокус върху 80/20 възможности (висок ефект, малко усилие)
- Вземи предвид моите ограничени ресурси
- Приоритизирай защитими конкурентни предимства

ФОРМАТ НА ОТГОВОР:
1. Възможност [Име]
   - Защо е важно (ROI потенциал)
   - Стъпки за внедряване (1-2-3)
   - Рискове за обмисляне`,
    },
    {
        id: "copywriter",
        category: "Маркетинг",
        title: "Elite Copywriter",
        prompt: `ДЕЙСТВАЙ КАТО: Елитен Копирайтър обучен в невромаркетинг и психология на убеждаването.

КОНТЕКСТ: 
- Продукт: [ТВОЯТ ПРОДУКТ/УСЛУГА]
- Целева Аудитория: [КОИ СА ТЕ? СТРАХОВЕ/ЖЕЛАНИЯ?]
- Уникална Стойност: [КАКВО ТЕ ПРАВИ РАЗЛИЧЕН?]

ЦЕЛ: Напиши копи оптимизиран за конверсии за [LANDING PAGE/EMAIL/РЕКЛАМА]

ТОН: [Директен/Професионален/Неформален] - БЕЗ корпоративен жаргон, БЕЗ излишества

СТРУКТУРА:
1. Hook (грабни вниманието за 3 секунди)
2. Проблем (разпали болката)
3. Решение (твоят уникален подход)
4. Доказателство (защо да ти вярват)
5. CTA (ясна следваща стъпка)

ОГРАНИЧЕНИЯ:
- Под 200 думи
- Използвай силни думи без хайп
- Само един ясен CTA`,
    },
    {
        id: "analyst",
        category: "Анализ",
        title: "Data Analyst",
        prompt: `ДЕЙСТВАЙ КАТО: Старши Анализатор на Данни специализиран в бизнес интелигентност.

КОНТЕКСТ: Имам следния dataset: [ОПИШИ ДАННИТЕ]

ЦЕЛ: Анализирай данните и извлечи приложими прозрения.

АНАЛИТИЧНА РАМКА:
1. Ключови Модели - Какво изпъква?
2. Аномалии - Какво не пасва в модела?
3. Корелации - Какво влияе на какво?
4. Препоръки - Какво трябва да направя базирано на това?

РЕЗУЛТАТ:
- Използвай прост език (без жаргон)
- Подчертай само топ 3 прозрения
- Дай конкретни действия
- Включи ниво на сигурност за всяко прозрение (Високо/Средно/Ниско)`,
    },
];

export default function PromptPlayground() {
    const [selectedPrompt, setSelectedPrompt] = useState<PromptOption>(SAMPLE_PROMPTS[0]);
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(selectedPrompt.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative z-10 py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Heading */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        🎮 <span className="gradient-text">Опитай промпт</span> от библиотеката
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Виж как изглеждат професионалните промпти. Без регистрация.
                    </p>
                </motion.div>

                {/* Playground Card */}
                <motion.div
                    className="group relative"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Layered card effect - outer border/shadow */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-600/40 via-fuchsia-600/40 to-purple-600/40 rounded-3xl blur-md" />
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/60 via-fuchsia-500/60 to-purple-500/60 rounded-3xl" />

                    {/* Multi-layer Glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-600 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-400 via-fuchsia-400 to-purple-400 rounded-3xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

                    {/* Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border-2 border-purple-500/40 group-hover:border-purple-400/60 rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-300">
                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full flex items-center justify-between px-5 py-3.5 bg-black/60 border-2 border-purple-500/50 rounded-xl hover:border-fuchsia-500/70 hover:bg-black/80 transition-all duration-300 shadow-lg shadow-purple-500/20"
                            >
                                <span className="text-white font-medium">
                                    {selectedPrompt.category}: {selectedPrompt.title}
                                </span>
                                <motion.svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="text-fuchsia-400"
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <path
                                        d="M6 9L12 15L18 9"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </motion.svg>
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl overflow-hidden z-10 shadow-2xl shadow-purple-500/30"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {SAMPLE_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt.id}
                                                onClick={() => {
                                                    setSelectedPrompt(prompt);
                                                    setIsOpen(false);
                                                }}
                                                className="w-full text-left px-5 py-3 hover:bg-purple-600/30 transition-colors duration-200 border-b border-purple-500/20 last:border-0"
                                            >
                                                <div className="text-fuchsia-300 text-sm font-medium">
                                                    {prompt.category}
                                                </div>
                                                <div className="text-white">{prompt.title}</div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Prompt Preview with Syntax Highlighting */}
                        <div className="relative bg-black/90 rounded-xl p-6 border-2 border-purple-500/30 shadow-inner">
                            <pre className="text-sm sm:text-base font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                                {selectedPrompt.prompt.split('\n').map((line, i) => {
                                    // Syntax highlighting logic
                                    if (line.includes('ДЕЙСТВАЙ КАТО:') || line.includes('ACT AS:')) {
                                        return <div key={i} className="text-cyan-400 font-semibold">{line}</div>;
                                    } else if (line.includes('КОНТЕКСТ:') || line.includes('CONTEXT:') ||
                                        line.includes('ЦЕЛ:') || line.includes('OBJECTIVE:') ||
                                        line.includes('ОГРАНИЧЕНИЯ:') || line.includes('CONSTRAINTS:') ||
                                        line.includes('СТРУКТУРА:') || line.includes('STRUCTURE:') ||
                                        line.includes('РЕЗУЛТАТ:') || line.includes('OUTPUT:') ||
                                        line.includes('ТОН:') || line.includes('TONE:') ||
                                        line.includes('ФОРМАТ НА ОТГОВОР:') || line.includes('OUTPUT FORMAT:') ||
                                        line.includes('АНАЛИТИЧНА РАМКА:') || line.includes('ANALYSIS FRAMEWORK:')) {
                                        return <div key={i} className="text-purple-400 font-semibold">{line}</div>;
                                    } else if (line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
                                        return <div key={i} className="text-gray-300">{line}</div>;
                                    } else if (line.includes('[') && line.includes(']')) {
                                        return <div key={i} className="text-fuchsia-300">{line}</div>;
                                    } else if (line.trim() === '') {
                                        return <div key={i}>&nbsp;</div>;
                                    } else {
                                        return <div key={i} className="text-gray-400">{line}</div>;
                                    }
                                })}
                            </pre>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-700/40 to-purple-600/40 hover:from-purple-600/60 hover:to-purple-500/60 border-2 border-purple-500/60 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-400/50 hover:scale-[1.02]"
                            >
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="w-5 h-5 text-green-400" />
                                            <span className="text-green-400 font-semibold">Копирано!</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Copy className="w-5 h-5 text-purple-200" />
                                            <span className="text-white font-semibold">Копирай промпт</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            {/* Login CTA */}
                            <a
                                href="/login"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-xl font-semibold text-white shadow-lg shadow-fuchsia-500/50 hover:shadow-fuchsia-400/60 transition-all duration-300 hover:scale-[1.02] border-2 border-fuchsia-400/30"
                            >
                                Влез за пълен достъп →
                            </a>
                        </div>

                        {/* Limit Notice */}
                        <p className="text-center text-gray-500 text-sm">
                            Безплатен достъп до 3 промпта дневно без регистрация
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
