"use client";

import BentoCard from "./BentoCard";
import { FadeUpSection } from "./AnimatedSection";
import { Zap, CheckCircle, Users } from "lucide-react";

export default function BentoGrid2() {
    const expertPoints = [
        "Научи се да използваш AI инструменти като професионалист",
        "Получи готови шаблони и команди за веднага",
        "Приложи знанията в реални проекти още днес",
    ];

    return (
        <section id="about" className="py-24 px-6">
            <FadeUpSection className="max-w-[1400px] mx-auto">
                {/* 3x3 Grid - stacked on mobile, 3-col on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-4 md:gap-6">

                    {/* Cell 1: Video */}
                    <BentoCard showGradient={false} className="relative overflow-hidden min-h-[200px] md:min-h-[280px] md:row-span-1 md:col-span-1">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source src="/videos/Landing2.webm" type="video/webm" />
                        </video>
                        {/* Subtle overlay */}

                    </BentoCard>

                    {/* Cells 2+3: "Стани експерт за един ден" */}
                    <BentoCard className="md:col-span-2 md:row-span-1 relative overflow-hidden">
                        {/* White base layer for clean yellow */}


                        <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-yellow-hover/20">
                                    <Zap className="h-8 w-8 text-accent-yellow" />
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-bold text-white">
                                    Стани експерт за един ден
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {expertPoints.map((point, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-accent-yellow flex-shrink-0 mt-0.5" />
                                        <p className="text-lg text-gray-200">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Cell 4: Video */}
                    <BentoCard showGradient={false} className="relative overflow-hidden min-h-[200px] md:min-h-0 md:row-span-1 md:col-span-1">
                        <div className="absolute inset-0">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src="/videos/Landing3.webm" type="video/webm" />
                            </video>

                        </div>
                    </BentoCard>

                    {/* Cell 5: "СЧУПИ БАРИЕРИТЕ" - with glitch effect */}
                    <BentoCard className="relative overflow-hidden min-h-[200px] md:min-h-0 md:row-span-1 md:col-span-1 group cursor-pointer">
                        {/* Animated gradient background */}
                        {/* White base layer for clean yellow */}



                        {/* Crack lines overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent transform origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-white/60 to-transparent transform origin-center scale-y-0 group-hover:scale-y-100 transition-transform duration-500 delay-100" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 transform origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-200" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45 transform origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-200" />
                            </div>
                        </div>

                        {/* Text with glitch effect */}
                        <div className="relative z-10 h-full flex items-center justify-center p-8">
                            <div className="relative group-hover:animate-pulse">
                                <h3 className="text-[44px] lg:text-[56px] font-black text-white text-center leading-tight tracking-tight relative">
                                    {/* Main text */}
                                    <span className="relative z-10 group-hover:animate-[shake_0.5s_ease-in-out]">
                                        СЧУПИ<br />БАРИЕРИТЕ
                                    </span>
                                    {/* Glitch layers */}
                                    <span className="absolute inset-0 text-fuchsia-400 opacity-0 group-hover:opacity-70 group-hover:animate-[glitch1_0.3s_infinite] z-0" aria-hidden="true">
                                        СЧУПИ<br />БАРИЕРИТЕ
                                    </span>
                                    <span className="absolute inset-0 text-cyan-400 opacity-0 group-hover:opacity-70 group-hover:animate-[glitch2_0.3s_infinite] z-0" aria-hidden="true">
                                        СЧУПИ<br />БАРИЕРИТЕ
                                    </span>
                                </h3>
                            </div>
                        </div>

                        {/* Glitch keyframes */}
                        <style jsx>{`
                            @keyframes glitch1 {
                                0%, 100% { transform: translate(0); }
                                20% { transform: translate(-3px, 3px); }
                                40% { transform: translate(3px, -3px); }
                                60% { transform: translate(-3px, -3px); }
                                80% { transform: translate(3px, 3px); }
                            }
                            @keyframes glitch2 {
                                0%, 100% { transform: translate(0); }
                                20% { transform: translate(3px, -3px); }
                                40% { transform: translate(-3px, 3px); }
                                60% { transform: translate(3px, 3px); }
                                80% { transform: translate(-3px, -3px); }
                            }
                            @keyframes shake {
                                0%, 100% { transform: translateX(0); }
                                10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                                20%, 40%, 60%, 80% { transform: translateX(2px); }
                            }
                        `}</style>
                    </BentoCard>

                    {/* Cell 6: Video */}
                    <BentoCard showGradient={false} className="relative overflow-hidden min-h-[200px] md:min-h-0 md:row-span-1 md:col-span-1">
                        <div className="absolute inset-0">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src="/videos/Landing4.webm" type="video/webm" />
                            </video>

                        </div>
                    </BentoCard>

                    {/* Cells 7+8: Mission Statement */}
                    <BentoCard className="md:col-span-2 md:row-span-1 relative overflow-hidden">
                        {/* White base layer for clean yellow */}


                        <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                                Даваме AI-конкурентно предимство<br />на хората на България
                            </h3>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="p-2 rounded-lg bg-accent-yellow/10">
                                    <Users className="h-6 w-6 text-accent-yellow" />
                                </div>
                                <p className="text-xl text-white font-semibold">
                                    Над 3000 души са пробвали методологията
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Cell 9: Image */}
                    <BentoCard showGradient={false} className="relative overflow-hidden min-h-[200px] md:min-h-0 md:row-span-1 md:col-span-1">
                        <div className="absolute inset-0">
                            <img
                                src="/images/placeholder-grid.jpg"
                                alt="Platform preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                    </BentoCard>
                </div>
            </FadeUpSection>
        </section>
    );
}
