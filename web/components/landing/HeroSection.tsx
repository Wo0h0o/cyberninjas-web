"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                >
                    <span className="text-white">AI ПРОМПТ</span>
                    <br />
                    <span className="gradient-text">БИБЛИОТЕКА</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
                >
                    Открий професионални AI промпти, курсове и ресурси за автоматизация
                    на работата ти с изкуствен интелект.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <a
                        href="/dashboard"
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-accent-yellow to-accent-yellow-hover rounded-full hover:shadow-lg hover:shadow-accent-yellow/50 transition-all duration-300 hover:scale-105"
                    >
                        Започни сега
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                        href="#features"
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-full hover:border-accent-yellow/50 hover:bg-white/5 transition-all duration-300"
                    >
                        Научи повече
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
