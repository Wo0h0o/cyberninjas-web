"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="relative py-20 sm:py-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-accent-yellow/10 to-accent-yellow-muted/10 border border-white/10 overflow-hidden"
                >
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/5 via-accent-yellow-muted/5 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10">
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                            Готов да започнеш с <span className="gradient-text">AI</span>?
                        </h2>

                        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                            Присъедини се към хиляди професионалисти, които вече използват AI
                            за автоматизация на работата си.
                        </p>

                        <a
                            href="/dashboard"
                            className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-text-on-yellow bg-accent-yellow rounded-full hover:bg-accent-yellow-hover transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            Създай безплатен акаунт
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
