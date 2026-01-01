"use client";

import BentoCard from "./BentoCard";
import { StaggerContainer, StaggerItem } from "./AnimatedSection";
import {
    Play,
    Book,
    Zap,
    Users,
    Calendar,
    Wrench,
    ExternalLink,
    Youtube,
    Newspaper,
    FileText,
    Sparkles,
    Copy,
    Lightbulb,
} from "lucide-react";

export default function BentoGrid1() {
    const libraryFeatures = [
        { icon: Copy, label: "Готови AI команди", description: "500+ готови за използване" },
        { icon: Play, label: "Видео Уроци", description: "Над 10 видео курса" },
    ];

    const resourceLinks = [
        {
            label: "AI Инструменти",
            icon: Wrench,
            description: "Курирана колекция от най-добрите AI tools"
        },
        {
            label: "Полезни линкове",
            icon: ExternalLink,
            description: "Ресурси, статии и документация"
        },
        {
            label: "Новини & Статии",
            icon: Newspaper,
            description: "Последни AI новини и анализи"
        },
        {
            label: "YouTube Канали",
            icon: Youtube,
            description: "Топ образователни канали за AI"
        },
    ];

    return (
        <section id="materials" className="py-24 px-6">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* Main 2-Column Layout: Left (1fr) | Right (2fr) */}
                <StaggerContainer className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6" staggerDelay={0.15}>

                    {/* LEFT COLUMN: Courses Card (spans full height of 2 rows visually) */}
                    <StaggerItem>
                        <BentoCard className="relative overflow-hidden min-h-[650px] lg:min-h-[740px]">
                            {/* Full-card Video Background */}
                            <div className="absolute inset-0">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                >
                                    <source src="/videos/landing1.webm" type="video/webm" />
                                </video>
                                {/* Bottom fade gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            </div>

                            {/* Content overlay - positioned at absolute bottom */}
                            <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
                                <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-5">
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                        Курсове за видео и снимкова генерация с AI
                                    </h3>
                                    <p className="text-gray-300 mb-4 text-sm">
                                        Ресурси и практични курсове за AI автоматизация.
                                    </p>
                                    <button className="w-full px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold transition-all text-sm">
                                        Започни обучение
                                    </button>
                                </div>
                            </div>
                        </BentoCard>
                    </StaggerItem>

                    {/* RIGHT COLUMN: Library + Resources stacked */}
                    <StaggerItem>
                        <div className="flex flex-col gap-6">

                            {/* Library Card */}
                            <BentoCard className="flex-1 min-h-[320px]">
                                <div className="p-6 lg:p-8 h-full flex flex-col">
                                    {/* Inline Title with Icon */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 rounded-2xl bg-gradient-to-br from-accent-yellow/8 to-accent-yellow-hover/8">
                                            <Book className="h-7 w-7 text-accent-yellow" />
                                        </div>
                                        <h3 className="text-3xl lg:text-4xl font-bold text-white">
                                            Библиотека с промптове
                                        </h3>
                                    </div>

                                    {/* Feature Icons Grid - 2 large boxes */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                                        {libraryFeatures.map((feature, i) => (
                                            <div
                                                key={i}
                                                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-yellow/30 transition-all group cursor-pointer"
                                            >
                                                <div className="p-4 rounded-xl bg-gradient-to-br from-accent-yellow/10 to-accent-yellow-hover/10 mb-4 group-hover:scale-110 transition-transform">
                                                    <feature.icon className="h-8 w-8 text-accent-yellow" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-base font-semibold text-white mb-1">{feature.label}</div>
                                                    <div className="text-sm text-gray-400">{feature.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full px-6 py-4 rounded-full bg-accent-yellow/10 hover:bg-accent-yellow/15 border border-accent-yellow/20 text-accent-yellow font-semibold transition-all">
                                        Разгледай
                                    </button>
                                </div>
                            </BentoCard>

                            {/* Resources Card */}
                            <BentoCard className="flex-1 min-h-[280px] lg:min-h-[320px] relative overflow-hidden">
                                {/* Purple gradient background */}


                                <div className="relative z-10 p-5 lg:p-8 h-full flex flex-col">
                                    {/* Title with Icon - stacked on mobile */}
                                    <div className="flex items-center gap-3 mb-4 lg:mb-6">
                                        <div className="p-2 lg:p-3 rounded-xl bg-white/10 backdrop-blur-sm flex-shrink-0">
                                            <Zap className="h-5 w-5 lg:h-6 lg:w-6 text-accent-yellow" />
                                        </div>
                                        <h3 className="text-xl lg:text-3xl font-bold text-white">
                                            Ресурси & Директории
                                        </h3>
                                    </div>

                                    {/* Resource Links Grid - 1 col on mobile, 2 on desktop */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                                        {resourceLinks.map((link, i) => (
                                            <button
                                                key={i}
                                                className="group p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-accent-yellow/50 transition-all flex items-center gap-3 text-left"
                                            >
                                                <div className="p-2 rounded-lg bg-accent-yellow/10 group-hover:bg-accent-yellow/15 transition-colors flex-shrink-0">
                                                    <link.icon className="h-4 w-4 lg:h-5 lg:w-5 text-accent-yellow" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-semibold text-white group-hover:text-accent-yellow transition-colors block">
                                                        {link.label}
                                                    </span>
                                                    <p className="text-xs text-gray-400 truncate lg:whitespace-normal">
                                                        {link.description}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </BentoCard>
                        </div>
                    </StaggerItem>
                </StaggerContainer>

                {/* Bottom Row: 3 Cards */}
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
                    {/* Най-нови курсове */}
                    <BentoCard className="relative overflow-hidden" hover={true}>
                        <div className="p-6 lg:p-8 h-full flex flex-col justify-center">
                            <div className="inline-block px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold mb-4 w-fit">
                                NEW
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-accent-yellow/10 to-accent-yellow-hover/10">
                                    <Calendar className="h-6 w-6 text-accent-yellow" />
                                </div>
                                <h4 className="text-2xl font-bold text-white">Най-нови курсове</h4>
                            </div>
                            <p className="text-gray-300 text-base leading-relaxed">
                                Първи научаваш. Първи прилагаш. Винаги една крачка пред останалите.
                            </p>
                        </div>
                    </BentoCard>

                    {/* Общност и Форум */}
                    <BentoCard hover={true}>
                        <div className="p-6 lg:p-8 h-full flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-accent-yellow/10">
                                    <Users className="h-6 w-6 text-accent-yellow" />
                                </div>
                                <h4 className="text-2xl font-bold text-white">Общност и Форум</h4>
                            </div>
                            <p className="text-gray-300 text-base leading-relaxed">
                                Хора, които вече го правят. Споделяй, питай, расти заедно с екип от практици.
                            </p>
                        </div>
                    </BentoCard>

                    {/* За Нас - Big CTA */}
                    <BentoCard className="relative overflow-hidden group" hover={true}>

                        <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center text-center">
                            <div className="mb-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                                <Zap className="h-8 w-8 text-fuchsia-300" />
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-3 leading-tight">
                                Запознай се с бъдещето на работа
                            </h4>

                            <p className="text-gray-300 text-sm mb-4">
                                Докато другите чакат — ти ще си готов.
                            </p>
                            <button className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold transition-all hover:scale-105">
                                Започни тук →
                            </button>
                        </div>
                    </BentoCard>
                </StaggerContainer>
            </div>
        </section>
    );
}
