"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TypingEffect,
  CodeRain,
  MouseSpotlight,
  CursorGlow,
  GlowBorderButton,
  PulseButton,
  StaggerReveal,
  StaggerContainer,
  StaggerItem,
  ShockwaveEffect,
} from "@/components/effects";
import PromptPlayground from "@/components/landing/PromptPlayground";
import BeforeAfterComparison from "@/components/landing/BeforeAfterComparison";
import { SectionDivider } from "@/components/landing/SectionDivider";

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

      {/* Code Rain Effect */}
      <CodeRain columns={25} />

      {/* Mouse Spotlight */}
      <MouseSpotlight />

      {/* Cursor Glow Trail */}
      <CursorGlow />


      {/* === HEADER === */}
      <header className="header">
        <div className="header-inner">
          <motion.a
            href="/"
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/landingpage-logo.png"
              alt="CyberNinjas Logo"
              className="h-16 w-auto"
            />
            <span className="text-2xl font-bold tracking-tight">
              Cyber<span className="gradient-text">Ninjas</span>
            </span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlowBorderButton
              href="/login"
              className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              }
            >
              Влез в платформата
            </GlowBorderButton>
          </motion.div>
        </div>
      </header>

      {/* === HERO SECTION === */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline with Typing Effect */}
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight mb-6 sm:mb-8 relative px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Shockwave Effect */}
            <ShockwaveEffect trigger={typingComplete} waveCount={3} />

            <TypingEffect
              text="Най-голямата промпт библиотека и образователна платформа за AI в България"
              className="text-white"
              speed={55}
              highlightWords={["промпт библиотека", "AI"]}
              onComplete={() => setTypingComplete(true)}
              slamEffect={true}
            />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Ресурси и практична академия за AI автоматизация.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <GlowBorderButton href="/login" icon={<BookIcon />}>
              Влез в платформата
            </GlowBorderButton>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider />

      {/* === PLAYGROUND SECTION === */}
      <PromptPlayground />

      {/* Section Divider */}
      <SectionDivider />

      {/* === WHAT WE OFFER SECTION === */}
      <section className="section">
        <div className="max-w-6xl mx-auto px-4">
          <StaggerReveal>
            <h2 className="section-title">
              Какво <span className="gradient-text">ще получиш</span>
            </h2>
          </StaggerReveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" staggerDelay={0.15}>
            {/* Card 1: Prompt Library */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Spinning gradient border */}
                <div className="absolute inset-0 rounded-2xl p-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 animate-gradient-xy group-hover:opacity-100 opacity-90">
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl" />
                </div>

                {/* Card content wrapper */}
                <div className="relative h-full">
                  {/* Content */}
                  <div className="p-8 text-center">
                    {/* Icon */}
                    <motion.div
                      className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                        <path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 7H16M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-1.5">
                      Промпт Библиотека
                    </h3>
                    {/* Visual separator */}
                    <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-transparent mb-3 mx-auto" />
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      Готови промпти за ChatGPT, Claude и др.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

                  {/* Animated Graphic: Marquee Tags - 4 rows */}
                  <div className="relative h-40 overflow-hidden bg-gray-950/50">
                    {/* Row 1 - top */}
                    <motion.div
                      className="absolute top-2 flex gap-2 whitespace-nowrap"
                      animate={{ x: ['-50%', '0%'] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      {['ChatGPT', 'Claude', 'Midjourney', 'DALL-E', 'Gemini', 'Copilot', 'ChatGPT', 'Claude', 'Midjourney', 'DALL-E', 'Gemini', 'Copilot'].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                          {tag}
                        </span>
                      ))}
                    </motion.div>

                    {/* Row 2 */}
                    <motion.div
                      className="absolute top-[26%] flex gap-2 whitespace-nowrap"
                      animate={{ x: ['0%', '-50%'] }}
                      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    >
                      {['Perplexity', 'GPT-4', 'Llama', 'Whisper', 'Suno', 'Runway', 'Perplexity', 'GPT-4', 'Llama', 'Whisper', 'Suno', 'Runway'].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-purple-500/15 text-purple-400/80 text-xs font-medium border border-purple-500/25">
                          {tag}
                        </span>
                      ))}
                    </motion.div>

                    {/* Row 3 */}
                    <motion.div
                      className="absolute top-[51%] flex gap-2 whitespace-nowrap"
                      animate={{ x: ['-50%', '0%'] }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    >
                      {['Leonardo', 'Bing', 'Bard', 'PaLM', 'Replicate', 'Hugging Face', 'Leonardo', 'Bing', 'Bard', 'PaLM', 'Replicate', 'Hugging Face'].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400/70 text-xs font-medium border border-purple-500/20">
                          {tag}
                        </span>
                      ))}
                    </motion.div>

                    {/* Row 4 - bottom */}
                    <motion.div
                      className="absolute bottom-2 flex gap-2 whitespace-nowrap"
                      animate={{ x: ['0%', '-50%'] }}
                      transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    >
                      {['Anthropic', 'Cohere', 'Jasper', 'Copy.ai', 'Writesonic', 'Notion AI', 'Anthropic', 'Cohere', 'Jasper', 'Copy.ai', 'Writesonic', 'Notion AI'].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400/70 text-xs font-medium border border-purple-500/20">
                          {tag}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Card 2: Video Courses */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Spinning gradient border */}
                <div className="absolute inset-0 rounded-2xl p-1 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 animate-gradient-xy group-hover:opacity-100 opacity-90">
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl" />
                </div>

                {/* Card content wrapper */}
                <div className="relative h-full">
                  {/* Content */}
                  <div className="p-8 text-center">
                    {/* Icon */}
                    <motion.div
                      className="mx-auto w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6"
                      whileHover={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.4 }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-violet-400">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
                      </svg>
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-1.5">
                      Видео Академия
                    </h3>
                    {/* Visual separator */}
                    <div className="h-0.5 w-12 bg-gradient-to-r from-violet-500 to-transparent mb-3 mx-auto" />
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      AI автоматизация от основи до експерт.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

                  {/* Before/After Comparison - показва трансформацията */}
                  <BeforeAfterComparison />
                </div>
              </div>
            </StaggerItem>

            {/* Card 3: Free Resources */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Spinning gradient border */}
                <div className="absolute inset-0 rounded-2xl p-1 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-fuchsia-600 animate-gradient-xy group-hover:opacity-100 opacity-90">
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl" />
                </div>

                {/* Card content wrapper */}
                <div className="relative h-full">
                  {/* Content */}
                  <div className="p-8 text-center">
                    {/* Icon */}
                    <motion.div
                      className="mx-auto w-16 h-16 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-6"
                      whileHover={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-fuchsia-400">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-1.5">
                      Безплатни Ресурси
                    </h3>
                    {/* Visual separator */}
                    <div className="h-0.5 w-12 bg-gradient-to-r from-fuchsia-500 to-transparent mb-3 mx-auto" />
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      Guides, библиотеки и community достъп.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />

                  {/* Animated Graphic: Resource icons - 2x2 grid */}
                  <div className="relative h-40 overflow-hidden bg-gray-950/50">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 p-6">
                      {[
                        {
                          svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="url(#grad1)" strokeWidth="2" /><path d="M8 10h8M8 14h5" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" /><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs></svg>,
                          label: 'Guides'
                        },
                        {
                          svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H6.5C5.12 21 4 19.88 4 18.5Z" stroke="url(#grad2)" strokeWidth="2" /><path d="M4 18.5C4 17.12 5.12 16 6.5 16H20" stroke="url(#grad2)" strokeWidth="2" /><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs></svg>,
                          label: 'Prompt Libraries'
                        },
                        {
                          svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="url(#grad3)" strokeWidth="2" /><defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs></svg>,
                          label: 'Resources'
                        },
                        {
                          svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="url(#grad4)" strokeWidth="2" /><circle cx="9" cy="7" r="4" stroke="url(#grad4)" strokeWidth="2" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="url(#grad4)" strokeWidth="2" /><defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs></svg>,
                          label: 'Community'
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          className="flex flex-col items-center gap-2"
                          animate={{
                            y: [0, -6, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 border border-fuchsia-500/30 flex items-center justify-center group-hover:border-fuchsia-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-fuchsia-500/20">
                            {item.svg}
                          </div>
                          <span className="text-xs text-fuchsia-300/80 font-medium">{item.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider />

      {/* === CTA SECTION === */}
      <section className="section">
        <div className="max-w-4xl mx-auto px-4">
          <StaggerReveal>
            <div className="glass-card p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Готов ли си да <span className="gradient-text">започнеш</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10">
                Регистрирай се безплатно и получи достъп до всички ресурси.
              </p>
              <PulseButton href="/register" className="text-base sm:text-lg md:text-xl px-8 sm:px-10 py-4 sm:py-5">
                Създай акаунт →
              </PulseButton>
            </div>
          </StaggerReveal>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="relative z-10 border-t border-white/10 py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          <motion.nav
            className="flex flex-wrap justify-center gap-4 sm:gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <a href="/about" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
              За нас
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
              Поверителност
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
              Условия
            </a>
            <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
              Контакт
            </a>
          </motion.nav>
          <motion.p
            className="text-gray-500 text-sm sm:text-base text-center sm:text-left"
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
