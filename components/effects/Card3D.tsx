"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Card3DProps {
    children: React.ReactNode;
    className?: string;
    showBorderBeam?: boolean;
}

export function Card3D({ children, className = "", showBorderBeam = false }: Card3DProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 200, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 200, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <div style={{ perspective: "1000px" }} className={className}>
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative"
            >
                {/* Border Beam Effect */}
                {showBorderBeam && isHovered && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 border-beam" />
                    </div>
                )}

                {/* Card Content */}
                <div
                    className={`
            relative glass-card
            transition-all duration-300
            ${isHovered ? "border-purple-500/50 shadow-[0_0_50px_rgba(139,92,246,0.2)]" : ""}
          `}
                    style={{ transform: "translateZ(50px)" }}
                >
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
