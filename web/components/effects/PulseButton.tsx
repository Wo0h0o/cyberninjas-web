"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PulseButtonProps {
    children: React.ReactNode;
    href?: string;
    className?: string;
}

export function PulseButton({ children, href, className = "" }: PulseButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative inline-block">
            {/* Pulse Rings */}
            <AnimatePresence>
                {isHovered && (
                    <>
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute inset-0 rounded-xl border border-purple-400/30"
                                initial={{ scale: 1, opacity: 0.4 }}
                                animate={{
                                    scale: [1, 1.3, 1.6],
                                    opacity: [0.4, 0.2, 0],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.3,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Button */}
            <motion.a
                href={href}
                className={`glow-button relative z-10 ${className}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {children}
            </motion.a>
        </div>
    );
}
