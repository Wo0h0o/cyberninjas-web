"use client";

import { motion } from "framer-motion";
import { Database, GraduationCap, BookOpen, Sparkles } from "lucide-react";

const stats = [
    {
        icon: Database,
        value: "500+",
        label: "AI команди",
    },
    {
        icon: GraduationCap,
        value: "5",
        label: "Академии",
    },
    {
        icon: BookOpen,
        value: "20+",
        label: "Ръководства",
    },
    {
        icon: Sparkles,
        value: "Стотици",
        label: "Ресурси",
    },
];

export default function StatsBar() {
    return (
        <section className="relative py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-yellow/30 hover:bg-white/[0.05] transition-all duration-300">
                                {/* Icon */}
                                <div className="mb-4 p-3 rounded-full bg-accent-yellow/10 text-accent-yellow group-hover:scale-110 transition-transform">
                                    <stat.icon className="h-6 w-6" />
                                </div>

                                {/* Value */}
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                                    {stat.value}
                                </div>

                                {/* Label */}
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
