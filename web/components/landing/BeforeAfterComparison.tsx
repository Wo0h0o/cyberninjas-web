"use client";

import { motion } from "framer-motion";

export default function BeforeAfterComparison() {
    return (
        <div className="relative h-40 overflow-hidden bg-gray-950/50">
            <div className="absolute inset-0 flex">
                {/* Before Side */}
                <div className="flex-1 px-4 py-4 border-r border-accent-yellow/20">
                    <div className="text-xs text-gray-500 mb-2">ПРЕДИ</div>
                    <div className="space-y-2">
                        <div className="text-xs text-gray-400 italic leading-relaxed">
                            "ChatGPT, напиши ми маркетинг текст"
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                            Разбира се! Ето един маркетинг текст за вашия продукт...
                        </div>
                    </div>
                </div>

                {/* After Side */}
                <div className="flex-1 px-4 py-4 bg-accent-yellow/5">
                    <div className="text-xs gradient-text font-semibold mb-2">СЛЕД DNA Protocol</div>
                    <div className="space-y-1.5">
                        <div className="text-xs text-accent-yellow font-mono leading-relaxed">
                            ДЕЙСТВАЙ КАТО: Елитен Копирайтър
                        </div>
                        <div className="text-xs text-gray-400 leading-relaxed">
                            КОНТЕКСТ: Болки на целевата аудитория...
                        </div>
                        <div className="text-xs text-gray-400 leading-relaxed">
                            ЦЕЛ: Създай копи оптимизиран за конверсии
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                            РЕЗУЛТАТ: Структуриран, оптимизиран текст
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Overlay with expanded content */}
            <motion.div
                className="absolute inset-0 bg-gray-900/98 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4"
                initial={false}
            >
                <div className="h-full flex gap-3">
                    {/* Before - Expanded */}
                    <div className="flex-1 flex flex-col">
                        <div className="text-xs text-gray-500 mb-2">ПРЕДИ</div>
                        <div className="flex-1 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 overflow-auto">
                            <p className="text-xs text-gray-400 italic mb-2">
                                "ChatGPT, напиши ми маркетинг текст"
                            </p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Разбира се! Ето един маркетинг текст за вашия продукт. Този продукт е много добър и качествен...
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-gradient-to-b from-transparent via-accent-yellow/50 to-transparent" />

                    {/* After - Expanded */}
                    <div className="flex-1 flex flex-col">
                        <div className="text-xs gradient-text font-semibold mb-2">СЛЕД DNA Protocol</div>
                        <div className="flex-1 bg-accent-yellow/5 rounded-lg p-3 border border-accent-yellow/30 overflow-auto">
                            <p className="text-xs text-accent-yellow font-mono mb-2">
                                ДЕЙСТВАЙ КАТО: Елитен Копирайтър обучен в невромаркетинг
                            </p>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                КОНТЕКСТ: Целева аудитория = [профил на идеалния клиент]<br />
                                ЦЕЛ: Създай копи с доказани формули за конверсия<br />
                                РЕЗУЛТАТ: Професионален, базиран на данни, фокусиран текст
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
