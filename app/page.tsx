"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TypingEffect,
  FloatingParticles,
  Card3D,
  MouseSpotlight,
  CursorGlow,
  MagneticButton,
  GlowBorderButton,
  PulseButton,
  StaggerReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/effects";

// Book/Knowledge Icon for button
const BookIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-purple-300"
  >
    <path
      d="M4 19.5V4.5C4 3.67157 4.67157 3 5.5 3H19C19.5523 3 20 3.44772 20 4V20C20 20.5523 19.5523 21 19 21H6.5C5.11929 21 4 19.8807 4 18.5Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M4 18.5C4 17.1193 5.11929 16 6.5 16H20"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 7H16M8 11H14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function Home() {
  const [typingComplete, setTypingComplete] = useState(false);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* === BACKGROUND EFFECTS === */}

      {/* Aurora Background */}
      <div className="aurora">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles count={60} />

      {/* Mouse Spotlight */}
      <MouseSpotlight />

      {/* Cursor Glow Trail */}
      <CursorGlow />

      {/* === HEADER === */}
      <header className="header">
        <div className="header-inner">
          <motion.a
            href="/"
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            Cyber<span className="gradient-text">Ninjas</span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a href="/dashboard" className="glow-button">
              Влез в платформата
            </a>
          </motion.div>
        </div>
      </header>

      {/* === HERO SECTION === */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-8 pt-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline with Typing Effect */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TypingEffect
              text="Най-голямата промпт библиотека и образователна платформа за AI в България"
              className="text-white"
              speed={70}
              highlightWords={["промпт библиотека", "AI"]}
              onComplete={() => setTypingComplete(true)}
            />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Ресурси и практични курсове за AI автоматизация.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <GlowBorderButton href="/dashboard" icon={<BookIcon />}>
              Влез в платформата
            </GlowBorderButton>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 2, duration: 0.5 },
            y: { delay: 2, duration: 1.5, repeat: Infinity },
          }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-gradient-to-b from-purple-400 to-fuchsia-400"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* === WHAT WE OFFER SECTION === */}
      <section className="section">
        <div className="max-w-6xl mx-auto">
          <StaggerReveal>
            <h2 className="section-title">
              Какво <span className="gradient-text">предлагаме</span>
            </h2>
          </StaggerReveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-10" staggerDelay={0.15}>
            <StaggerItem>
              <Card3D showBorderBeam>
                <div className="flex items-start gap-4">
                  <motion.div
                    className="shrink-0 w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                      <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 7H16M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Промпт Библиотека
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Стотици готови промпти за ChatGPT, Claude, Midjourney и други AI инструменти.
                    </p>
                  </div>
                </div>
              </Card3D>
            </StaggerItem>

            <StaggerItem>
              <Card3D showBorderBeam>
                <div className="flex items-start gap-4">
                  <motion.div
                    className="shrink-0 w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center"
                    whileHover={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.4 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-violet-400">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Видео Курсове
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Практични курсове за AI автоматизация - от основите до напреднали техники.
                    </p>
                  </div>
                </div>
              </Card3D>
            </StaggerItem>

            <StaggerItem>
              <Card3D showBorderBeam>
                <div className="flex items-start gap-4">
                  <motion.div
                    className="shrink-0 w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center"
                    whileHover={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-fuchsia-400">
                      <path d="M21 5L12 14L3 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 14V21" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Безплатни Ресурси
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Guides, checklists и инструменти за работа с AI. Всичко безплатно.
                    </p>
                  </div>
                </div>
              </Card3D>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="section">
        <div className="max-w-4xl mx-auto">
          <StaggerReveal>
            <div className="glass-card p-12 text-center">
              <h2 className="text-4xl font-bold mb-6">
                Готов ли си да <span className="gradient-text">започнеш</span>?
              </h2>
              <p className="text-xl text-gray-400 mb-10">
                Регистрирай се безплатно и получи достъп до всички ресурси.
              </p>
              <PulseButton href="/register" className="text-xl px-10 py-5">
                Създай акаунт →
              </PulseButton>
            </div>
          </StaggerReveal>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="relative z-10 border-t border-white/10 py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <motion.nav
            className="flex gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <a href="/about" className="text-gray-500 hover:text-white transition-colors">
              За нас
            </a>
            <a href="/privacy" className="text-gray-500 hover:text-white transition-colors">
              Поверителност
            </a>
            <a href="/terms" className="text-gray-500 hover:text-white transition-colors">
              Условия
            </a>
            <a href="/contact" className="text-gray-500 hover:text-white transition-colors">
              Контакт
            </a>
          </motion.nav>
          <motion.p
            className="text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            © 2024 CyberNinjas. Всички права запазени.
          </motion.p>
        </div>
      </footer>
    </main>
  );
}
