"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TypingEffect } from "@/components/effects";
import HexagonGrid from "./HexagonGrid";

export default function NewHero() {
  const [typingComplete, setTypingComplete] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 bg-black">
      {/* Hexagon Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <HexagonGrid
          hexSize={45}
          lineWidth={1}
          baseColor="rgba(255, 255, 255, 0.06)"
          glowColor="rgba(255, 255, 0, 0.5)"
          mouseRadius={200}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center pt-20">
        {/* Main Heading with Typing Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <TypingEffect
            text="Овладей силата на изкуствения интелект"
            speed={60}
            className="gradient-text"
            onComplete={() => setTypingComplete(true)}
          />
        </motion.h1>

        {/* Subtitle - appears after typing */}
        {typingComplete && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Най-голямата образователна платформа за AI в България
          </motion.p>
        )}

        {/* CTA Button - appears after typing */}
        {typingComplete && (
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold text-text-on-yellow bg-accent-yellow rounded-full shadow-lg hover:bg-accent-yellow-hover hover:-translate-y-1 transition-all duration-300"
          >
            Започни сега
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        )}
      </div>

    </section>
  );
}
