"use client";

import { Mail, Youtube, Instagram, Linkedin, Facebook } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        platform: [
            { label: "Курсове", href: "/dashboard/courses" },
            { label: "Библиотека", href: "/dashboard/library" },
            { label: "Ресурси", href: "/dashboard/resources" },
            { label: "Общност", href: "/dashboard/community" },
        ],
        company: [
            { label: "За нас", href: "#about" },
            { label: "FAQ", href: "#faq" },
            { label: "Блог", href: "/blog" },
            { label: "Контакти", href: "/contact" },
        ],
        legal: [
            { label: "Условия за ползване", href: "/terms" },
            { label: "Поверителност", href: "/privacy" },
        ],
    };

    const socialLinks = [
        { icon: Youtube, href: "https://youtube.com/@cyberninjas", label: "YouTube" },
        { icon: Instagram, href: "https://instagram.com/cyberninjas.bg", label: "Instagram" },
        { icon: Facebook, href: "https://facebook.com/cyberninjas", label: "Facebook" },
        { icon: Linkedin, href: "https://linkedin.com/company/cyberninjas", label: "LinkedIn" },
    ];

    return (
        <footer id="faq" className="bg-[#09090b] border-t border-white/10">
            {/* Main Footer Content */}
            <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <a href="/" className="flex items-center gap-3 mb-5">
                            <img
                                src="/images/logo.svg"
                                alt="CyberNinjas Logo"
                                className="h-10 w-auto"
                            />
                            <span className="text-xl font-bold">
                                <span className="text-white">Cyber</span>
                                <span className="text-accent-yellow">Ninjas</span>
                            </span>
                        </a>
                        <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-sm">
                            Най-голямата образователна платформа за AI в България.
                            Даваме AI-конкурентно предимство на хора и бизнеси.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-2">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-accent-yellow/20 border border-white/10 hover:border-accent-yellow/50 transition-all group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4 text-gray-400 group-hover:text-accent-yellow transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Платформа</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.platform.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-accent-yellow transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Компания</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-accent-yellow transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Правна информация</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-accent-yellow transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-[1400px] mx-auto px-6 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                            © {currentYear} CyberNinjas. Всички права запазени.
                        </p>
                        <a
                            href="mailto:contact@cyberninjas.bg"
                            className="text-sm text-gray-500 hover:text-accent-yellow transition-colors flex items-center gap-2"
                        >
                            <Mail className="h-4 w-4" />
                            contact@cyberninjas.bg
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
