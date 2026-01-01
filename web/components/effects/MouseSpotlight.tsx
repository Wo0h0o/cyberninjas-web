"use client";

import { useEffect, useState } from "react";

interface MouseSpotlightProps {
    className?: string;
}

export function MouseSpotlight({ className = "" }: MouseSpotlightProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <div
            className={`fixed inset-0 pointer-events-none z-10 overflow-hidden ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transition: "opacity 0.3s ease",
            }}
        >
            <div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                    left: position.x - 300,
                    top: position.y - 300,
                    background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
                    filter: "blur(40px)",
                    transition: "left 0.1s ease-out, top 0.1s ease-out",
                }}
            />
        </div>
    );
}
