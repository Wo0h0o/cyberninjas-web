"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function NewHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: "За Нас", href: "#about" },
        { label: "Материали", href: "#materials" },
        { label: "FAQ", href: "#faq" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
            <div className="w-full mx-auto px-8 lg:px-16">
                <nav className="flex items-center justify-between h-20">
                    {/* Left: Logo & Brand */}
                    <a href="/" className="flex items-center gap-3 group">
                        <img
                            src="/images/logo.svg"
                            alt="CyberNinjas Logo"
                            className="h-10 w-auto transition-transform group-hover:scale-105"
                        />
                        <span className="text-xl font-bold">
                            <span className="text-white">Cyber</span>
                            <span className="text-accent-yellow">Ninjas</span>
                        </span>
                    </a>

                    {/* Center: Navigation Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="nav-link text-base font-medium text-white hover:text-accent-yellow transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-yellow group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                    </div>

                    {/* Right: Login Button */}
                    <a
                        href="/login"
                        className="hidden md:inline-flex items-center px-6 py-3 text-sm font-semibold border border-white/20 rounded-full hover:bg-white/5 hover:border-accent-yellow/50 transition-all duration-300"
                    >
                        Влез в Платформата
                    </a>

                    {/* Mobile: Hamburger Menu */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-white hover:text-accent-yellow transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </nav>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden border-t border-white/10 bg-[#09090b]/98 backdrop-blur-xl"
                    >
                        <div className="px-6 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-base font-medium text-white hover:text-accent-yellow transition-colors py-2"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <a
                                href="/login"
                                className="block w-full text-center px-6 py-3 text-sm font-semibold border border-white/20 rounded-full hover:bg-white/5 hover:border-accent-yellow/50 transition-all duration-300"
                            >
                                Влез в Платформата
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
