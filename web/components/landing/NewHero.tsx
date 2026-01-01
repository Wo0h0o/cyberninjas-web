"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TypingEffect } from "@/components/effects";
import ParticleNetwork from "./ParticleNetwork";

export default function NewHero() {
  const [typingComplete, setTypingComplete] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 bg-black">
      {/* Particle Network Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleNetwork
          particleCount={60}
          connectionDistance={150}
          particleSpeed={0.3}
          mouseRadius={180}
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

      {/* Gradient Fade - stronger */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-black/80 to-black pointer-events-none" />

      {/* Wave Divider with Gradient */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-[80px] md:h-[100px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="1" />
              <stop offset="50%" stopColor="#000000" stopOpacity="1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 C150,80 350,80 600,50 C850,20 1050,20 1200,50 L1200,120 L0,120 Z"
            fill="url(#waveGradient)"
          />
        </svg>
      </div>
    </section>
  );
}
