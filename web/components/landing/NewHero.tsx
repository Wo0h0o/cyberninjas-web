"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import HexagonGrid from "./HexagonGrid";

export default function NewHero() {
  const [showContent, setShowContent] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // Timeline:
    // 0-1.0s: Fade-in + scale (partially overlaps)
    // 1.0-2.5s: Hexagon animation
    // 3.8s+: Text appears
    const contentTimer = setTimeout(() => setShowContent(true), 3800);
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 4600);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 5300);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(buttonsTimer);
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative min-h-[90vh] flex items-center justify-center px-6 bg-black overflow-hidden"
    >
      {/* Hexagon Grid Background with Integrated Logo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-auto">
        <HexagonGrid
          hexSize={45}
          lineWidth={1}
          baseOpacity={0.15}
          mouseRadius={40}
          showLogo={true}
          logoOffsetX={0.65}
          logoOffsetY={0.5}
          animationDelay={1.0}
        />
      </div>

      {/* Content - Text on Left - pointer-events-none to allow hexagon hover */}
      <div className="relative z-10 w-full max-w-7xl mx-auto pointer-events-none">
        <div className="max-w-2xl pt-12 lg:pt-[50px] lg:-ml-[90px]">
          {/* Main Heading - Smooth fade in with glow after hexagon animation */}
          {showContent && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                textShadow: [
                  "0 0 0px rgba(255, 255, 0, 0)",
                  "0 0 30px rgba(255, 255, 0, 0.5)",
                  "0 0 10px rgba(255, 255, 0, 0.2)"
                ]
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
                textShadow: { duration: 1.5, times: [0, 0.3, 1] }
              }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight gradient-text"
            >
              Овладей силата на изкуствения интелект
            </motion.h1>
          )}

          {/* Subtitle - appears after heading */}
          {showSubtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-lg sm:text-xl text-white mb-10 max-w-xl"
            >
              Най-голямата образователна платформа за AI в България.
              AI команди, курсове и ръководства на едно място.
            </motion.p>
          )}

          {/* CTA Buttons - appears after subtitle */}
          {showButtons && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 pointer-events-auto"
            >
              <a
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-text-on-yellow bg-accent-yellow rounded-full shadow-lg hover:bg-accent-yellow-hover hover:-translate-y-1 transition-all duration-300"
              >
                Започни сега
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#about"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-full hover:border-accent-yellow/50 hover:bg-white/5 transition-all duration-300"
              >
                Разгледай
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
