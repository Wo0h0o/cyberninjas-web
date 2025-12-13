"use client";

import { useEffect, useState } from "react";

interface CursorGlowProps {
    className?: string;
}

export function CursorGlow({ className = "" }: CursorGlowProps) {
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let id = 0;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });

            id++;
            const newPoint = { x: e.clientX, y: e.clientY, id };

            setTrail(prev => {
                const updated = [...prev, newPoint].slice(-15);
                return updated;
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Clean up old trail points
    useEffect(() => {
        const interval = setInterval(() => {
            setTrail(prev => prev.slice(1));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
            {/* Trail dots */}
            {trail.map((point, index) => (
                <div
                    key={point.id}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        left: point.x - 4,
                        top: point.y - 4,
                        background: `rgba(168, 85, 247, ${(index / trail.length) * 0.6})`,
                        boxShadow: `0 0 ${10 + index}px rgba(168, 85, 247, ${(index / trail.length) * 0.4})`,
                        transform: `scale(${0.5 + (index / trail.length) * 0.5})`,
                    }}
                />
            ))}

            {/* Main cursor glow */}
            <div
                className="absolute w-6 h-6 rounded-full"
                style={{
                    left: mousePos.x - 12,
                    top: mousePos.y - 12,
                    background: "radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, transparent 70%)",
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)",
                }}
            />
        </div>
    );
}
