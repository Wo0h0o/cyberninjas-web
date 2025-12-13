"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface GlowBorderButtonProps {
    children: React.ReactNode;
    href?: string;
    className?: string;
    icon?: React.ReactNode;
}

export function GlowBorderButton({
    children,
    href,
    className = "",
    icon,
}: GlowBorderButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 15 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        x.set(distanceX * 0.2);
        y.set(distanceY * 0.2);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <div
            ref={ref}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="inline-block"
        >
            <motion.a
                href={href}
                className={`glow-border-button group ${className}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Animated gradient border */}
                <span className="glow-border-animation" />

                {/* Button content */}
                <span className="glow-border-content">
                    {icon && (
                        <motion.span
                            className="inline-block mr-3"
                            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                            {icon}
                        </motion.span>
                    )}
                    {children}
                </span>
            </motion.a>
        </div>
    );
}
