"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface HexagonItem {
    id: string;
    type: "logo" | "image" | "empty";
    src?: string;
    alt?: string;
    label?: string;
}

const hexagonItems: HexagonItem[] = [
    { id: "1", type: "empty" },
    { id: "2", type: "image", src: "/images/preview-prompts.png", alt: "AI Prompts", label: "Промптове" },
    { id: "3", type: "empty" },
    { id: "4", type: "image", src: "/images/preview-courses.png", alt: "Courses", label: "Курсове" },
    { id: "5", type: "logo", src: "/landingpage-logo.png", alt: "CyberNinjas" },
    { id: "6", type: "image", src: "/images/preview-tools.png", alt: "AI Tools", label: "Инструменти" },
    { id: "7", type: "empty" },
    { id: "8", type: "image", src: "/images/preview-guides.png", alt: "Guides", label: "Ръководства" },
    { id: "9", type: "empty" },
];

export default function HexagonShowcase() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const hexSize = 80; // Size of each hexagon
    const hexWidth = hexSize * 2;
    const hexHeight = hexSize * Math.sqrt(3);
    const gap = 8;

    // Calculate positions for 3x3 honeycomb grid
    const getPosition = (index: number) => {
        const row = Math.floor(index / 3);
        const col = index % 3;

        // Offset odd rows for honeycomb effect
        const offsetX = row % 2 === 1 ? (hexWidth * 0.75 + gap) / 2 : 0;

        return {
            x: col * (hexWidth * 0.75 + gap) + offsetX,
            y: row * (hexHeight * 0.5 + gap / 2),
        };
    };

    // SVG hexagon path
    const getHexPath = (size: number) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = size + size * Math.cos(angle);
            const y = size * Math.sqrt(3) / 2 + size * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return points.join(" ");
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div
                className="relative"
                style={{
                    width: 3 * (hexWidth * 0.75 + gap) + hexWidth * 0.25,
                    height: 3 * (hexHeight * 0.5 + gap / 2) + hexHeight * 0.5,
                }}
            >
                {hexagonItems.map((item, index) => {
                    const pos = getPosition(index);
                    const isHovered = hoveredId === item.id;
                    const isCenter = item.type === "logo";
                    const hasContent = item.type !== "empty";

                    return (
                        <motion.div
                            key={item.id}
                            className="absolute cursor-pointer"
                            style={{
                                left: pos.x,
                                top: pos.y,
                                width: hexWidth,
                                height: hexHeight,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: isHovered && hasContent ? 1.1 : 1,
                            }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                scale: { duration: 0.2 }
                            }}
                            onMouseEnter={() => hasContent && setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <svg
                                width={hexWidth}
                                height={hexHeight}
                                viewBox={`0 0 ${hexWidth} ${hexHeight}`}
                                className="absolute inset-0"
                            >
                                <defs>
                                    <clipPath id={`hex-clip-${item.id}`}>
                                        <polygon points={getHexPath(hexSize)} />
                                    </clipPath>
                                    <filter id={`glow-${item.id}`}>
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Background fill for content hexagons */}
                                {hasContent && (
                                    <polygon
                                        points={getHexPath(hexSize)}
                                        fill={isCenter ? "rgba(255, 255, 0, 0.1)" : "rgba(0, 0, 0, 0.8)"}
                                        stroke={isHovered || isCenter ? "#FFFF00" : "rgba(255, 255, 255, 0.15)"}
                                        strokeWidth={isCenter ? 2 : 1}
                                        filter={isHovered || isCenter ? `url(#glow-${item.id})` : undefined}
                                    />
                                )}

                                {/* Empty hexagon outline */}
                                {!hasContent && (
                                    <polygon
                                        points={getHexPath(hexSize)}
                                        fill="transparent"
                                        stroke="rgba(255, 255, 255, 0.08)"
                                        strokeWidth={1}
                                    />
                                )}
                            </svg>

                            {/* Image content */}
                            {item.type === "image" && item.src && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center p-4"
                                    style={{
                                        clipPath: `polygon(${getHexPath(hexSize).split(" ").map(p => {
                                            const [x, y] = p.split(",");
                                            return `${(parseFloat(x) / hexWidth) * 100}% ${(parseFloat(y) / hexHeight) * 100}%`;
                                        }).join(", ")})`,
                                    }}
                                >
                                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 rounded-lg bg-accent-yellow/20 flex items-center justify-center mb-1">
                                            <span className="text-2xl">
                                                {item.id === "2" && "💬"}
                                                {item.id === "4" && "📚"}
                                                {item.id === "6" && "🛠️"}
                                                {item.id === "8" && "📖"}
                                            </span>
                                        </div>
                                        {item.label && (
                                            <span className="text-xs text-white/80 font-medium text-center">
                                                {item.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Logo content */}
                            {item.type === "logo" && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Image
                                        src="/landingpage-logo.png"
                                        alt="CyberNinjas Logo"
                                        width={80}
                                        height={80}
                                        className="object-contain drop-shadow-lg"
                                    />
                                </div>
                            )}

                            {/* Hover label */}
                            {isHovered && item.label && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 rounded-full text-xs text-white whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
