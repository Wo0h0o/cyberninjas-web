"use client";

import { useEffect, useRef } from "react";

interface HexagonGridProps {
    hexSize?: number;
    lineWidth?: number;
    baseColor?: string;
    glowColor?: string;
    mouseRadius?: number;
}

export default function HexagonGrid({
    hexSize = 40,
    lineWidth = 1,
    baseColor = "rgba(255, 255, 255, 0.08)",
    glowColor = "rgba(255, 255, 0, 0.6)",
    mouseRadius = 150,
}: HexagonGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -1000, y: -1000 });
    const animationFrameId = useRef<number | null>(null);
    const time = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let dpr = 1;

        // Set canvas size with device pixel ratio for crisp rendering
        const resizeCanvas = () => {
            dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        // Draw a single flat-top hexagon
        const drawHexagon = (
            centerX: number,
            centerY: number,
            size: number,
            opacity: number,
            isGlowing: boolean,
            glowIntensity: number
        ) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                // Flat-top hexagon: start angle at 0 degrees
                const angle = (Math.PI / 3) * i;
                const x = centerX + size * Math.cos(angle);
                const y = centerY + size * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();

            if (isGlowing && glowIntensity > 0) {
                // Glow effect
                ctx.strokeStyle = glowColor.replace("0.6", String(0.6 * glowIntensity));
                ctx.lineWidth = lineWidth + 2;
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 15 * glowIntensity;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Base hexagon
            ctx.strokeStyle = baseColor.replace("0.08", String(0.08 + opacity * 0.12));
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        };

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouse.current = { x: -1000, y: -1000 };
        };

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas) return;

            const rect = canvas.getBoundingClientRect();
            time.current += 0.01;

            // Clear canvas
            ctx.clearRect(0, 0, rect.width, rect.height);

            // Flat-top hexagon geometry:
            // size = radius from center to vertex
            // width = 2 * size (horizontal span)
            // height = sqrt(3) * size (vertical span)
            const size = hexSize;
            const hexWidth = size * 2;
            const hexHeight = size * Math.sqrt(3);

            // Grid spacing for flat-top honeycomb:
            // Horizontal: 3/4 of width between column centers
            // Vertical: full height between row centers
            // Odd columns offset down by 1/2 height
            const colSpacing = hexWidth * 0.75;
            const rowSpacing = hexHeight;

            const cols = Math.ceil(rect.width / colSpacing) + 2;
            const rows = Math.ceil(rect.height / rowSpacing) + 2;

            // Draw hexagon grid
            for (let col = -1; col < cols; col++) {
                for (let row = -1; row < rows; row++) {
                    const centerX = col * colSpacing;
                    // Offset odd columns by half the row spacing
                    const centerY = row * rowSpacing + (col % 2 === 1 ? rowSpacing / 2 : 0);

                    // Calculate distance from mouse
                    const dx = mouse.current.x - centerX;
                    const dy = mouse.current.y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Mouse proximity effect
                    const isNearMouse = distance < mouseRadius;
                    const glowIntensity = isNearMouse
                        ? Math.pow(1 - distance / mouseRadius, 2)
                        : 0;

                    // Subtle pulsing for scattered hexagons
                    const pulsePhase = Math.sin(time.current * 1.5 + col * 0.3 + row * 0.5);
                    const basePulse = (pulsePhase + 1) * 0.06;

                    // Random glow pattern
                    const shouldGlow = isNearMouse ||
                        ((col * 7 + row * 11) % 17 === 0 && pulsePhase > 0.5);

                    drawHexagon(
                        centerX,
                        centerY,
                        size * 0.9, // Slightly smaller for gap between hexagons
                        basePulse,
                        shouldGlow,
                        glowIntensity + (shouldGlow && !isNearMouse ? 0.2 : 0)
                    );
                }
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        // Initialize
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [hexSize, lineWidth, baseColor, glowColor, mouseRadius]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
                width: "100%",
                height: "100%",
            }}
        />
    );
}
