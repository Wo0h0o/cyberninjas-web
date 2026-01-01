"use client";

import { motion } from "framer-motion";
import { Library, Video, Download } from "lucide-react";

const features = [
    {
        icon: Library,
        title: "Промпт Библиотека",
        description:
            "Над 500 професионални AI промпти за ChatGPT, Claude, Midjourney и други платформи.",
        placeholder: "prompt-library-preview.gif",
    },
    {
        icon: Video,
        title: "Видео Академии",
        description:
            "5 специализирани академии с практични курсове за AI автоматизация от начално до напреднало ниво.",
        placeholder: "video-courses-preview.gif",
    },
    {
        icon: Download,
        title: "Безплатни Ресурси",
        description:
            "20+ подробни ръководства, checklists и templates за ефективна работа с AI инструменти.",
        placeholder: "resources-preview.gif",
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="relative py-20 sm:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                        Какво <span className="gradient-text">предлагаме</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Всичко необходимо за успешна работа с AI на едно място
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="group relative"
                        >
                            <div className="h-full flex flex-col p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-yellow/30 hover:bg-white/[0.05] transition-all duration-300">
                                {/* Icon */}
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20 w-fit">
                                    <feature.icon className="h-8 w-8 text-accent-yellow" />
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-400 mb-6 flex-grow leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* GIF Placeholder */}
                                <div className="relative aspect-video rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20 border border-white/10 overflow-hidden">
                                    {/* Placeholder for future GIF */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🎬</div>
                                            <div className="text-sm text-gray-500">
                                                {feature.placeholder}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
