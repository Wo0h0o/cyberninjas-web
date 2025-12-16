"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ShockwaveEffectProps {
    trigger: boolean;
    color?: string;
    waveCount?: number;
}

export function ShockwaveEffect({
    trigger,
    color = "rgb(168, 85, 247)", // purple-500
    waveCount = 3,
}: ShockwaveEffectProps) {
    return (
        <AnimatePresence>
            {trigger && (
                <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
                    {Array.from({ length: waveCount }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                border: `2px solid ${color}`,
                                boxShadow: `0 0 20px ${color}`,
                            }}
                            initial={{
                                width: "0%",
                                height: "0%",
                                opacity: 0,
                            }}
                            animate={{
                                width: ["0%", "150%", "200%"],
                                height: ["0%", "150%", "200%"],
                                opacity: [0, 0.6, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.15,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}
