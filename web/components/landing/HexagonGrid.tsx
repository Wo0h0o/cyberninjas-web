"use client";

import { useEffect, useRef } from "react";

interface HexagonGridProps {
    hexSize?: number;
    lineWidth?: number;
    baseOpacity?: number; // Opacity for regular hexagons (0-1)
    mouseRadius?: number;
    showLogo?: boolean;
    logoOffsetX?: number;
    logoOffsetY?: number;
    debugMode?: boolean;
    animationDelay?: number;
}

export default function HexagonGrid({
    hexSize = 40,
    lineWidth = 1,
    baseOpacity = 0.15,
    mouseRadius = 150,
    showLogo = true,
    logoOffsetX = 0.6,
    logoOffsetY = 0.5,
    debugMode = false,
    animationDelay = 0,
}: HexagonGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -1000, y: -1000 });
    const animationFrameId = useRef<number | null>(null);
    const time = useRef(0);
    const startTime = useRef<number | null>(null); // For intro animation

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let dpr = 1;

        const resizeCanvas = () => {
            dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        // Define logo pattern: "><" horizontal X shape (11 cols x 5 rows)
        // Format: "row,col" - row is vertical (0-4), col is horizontal (0-10)
        // Center is at col 5, tips meet there

        // Define logo pattern: "><" chevrons meeting at center
        // Center at col 5, row 2 (5th col is odd, so offset down)

        // Define logo pattern: "><" wide chevrons
        // Center at col 5, row 2

        // Define logo pattern: "><"
        // Using column-offset system (odd columns shifted down)
        // Center at col 5, row 2

        const whiteLogoHexes = new Set<string>([
            // Left Part ">" (White)
            "0,1", "0,2", "1,3", "1,4", "2,4", "3,3", "3,2", "4,1"
        ]);

        const yellowLogoHexes = new Set<string>([
            // Right Part "<" (Yellow)
            "0,9", "0,8", "1,7", "1,6", "2,6", "3,7", "3,8", "4,9"
        ]);

        // Center hexagon at col 5, row 2 (split glow)
        const centerCol = 5;
        const centerRow = 2;



        // Draw a single flat-top hexagon
        const drawHexagon = (
            centerX: number,
            centerY: number,
            size: number,
            color: string,
            glowColor?: string,
            glowIntensity: number = 0,
            splitGlow?: { left: string; right: string }
        ) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
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

            // Split glow for center hexagon
            if (splitGlow && glowIntensity > 0) {
                ctx.save();

                // Left half - white glow
                ctx.beginPath();
                ctx.rect(centerX - size * 2, centerY - size * 2, size * 2, size * 4);
                ctx.clip();
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const x = centerX + size * Math.cos(angle);
                    const y = centerY + size * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.strokeStyle = splitGlow.left;
                ctx.lineWidth = lineWidth + 6; // Thicker line
                ctx.shadowColor = splitGlow.left;
                ctx.shadowBlur = 40 * glowIntensity; // Much stronger glow
                ctx.stroke();
                ctx.restore();

                ctx.save();
                // Right half - yellow glow
                ctx.beginPath();
                ctx.rect(centerX, centerY - size * 2, size * 2, size * 4);
                ctx.clip();
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const x = centerX + size * Math.cos(angle);
                    const y = centerY + size * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.strokeStyle = splitGlow.right;
                ctx.lineWidth = lineWidth + 6; // Thicker line
                ctx.shadowColor = splitGlow.right;
                ctx.shadowBlur = 40 * glowIntensity; // Much stronger glow
                ctx.stroke();
                ctx.restore();
            } else if (glowColor && glowIntensity > 0) {
                ctx.strokeStyle = glowColor;
                ctx.lineWidth = lineWidth + 5; // Thicker line
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 35 * glowIntensity; // Much stronger glow
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Base hexagon stroke
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        };

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

        const animate = () => {
            if (!ctx || !canvas) return;

            const rect = canvas.getBoundingClientRect();
            time.current += 0.01;

            ctx.clearRect(0, 0, rect.width, rect.height);

            const size = hexSize;
            const hexWidth = size * 2;
            const hexHeight = size * Math.sqrt(3);
            const colSpacing = hexWidth * 0.75;
            const rowSpacing = hexHeight;

            const cols = Math.ceil(rect.width / colSpacing) + 2;
            const rows = Math.ceil(rect.height / rowSpacing) + 2;

            // Calculate logo center position in grid coordinates
            const logoCenterX = Math.floor(cols * logoOffsetX);
            const logoCenterY = Math.floor(rows * logoOffsetY);

            for (let col = -1; col < cols; col++) {
                for (let row = -1; row < rows; row++) {
                    // Column-based offset: odd columns shift down
                    const centerX = col * colSpacing;
                    const centerY = row * rowSpacing + (col % 2 === 1 ? rowSpacing / 2 : 0);

                    // Check if this hex is part of logo pattern
                    const logoRow = row - logoCenterY + centerRow;
                    const logoCol = col - logoCenterX + centerCol;
                    const logoKey = `${logoRow},${logoCol}`;

                    const isWhiteLogo = showLogo && whiteLogoHexes.has(logoKey);
                    const isYellowLogo = showLogo && yellowLogoHexes.has(logoKey);
                    const isCenterLogo = showLogo && logoRow === centerRow && logoCol === centerCol;
                    const isLogoHex = isWhiteLogo || isYellowLogo || isCenterLogo;

                    // Calculate distance from logo center for wave effect
                    const distFromCenter = Math.sqrt(
                        Math.pow(logoCol - centerCol, 2) + Math.pow(logoRow - centerRow, 2)
                    );

                    // === CENTER HEXAGON STAGED INTRO (with delay) ===
                    // Animation starts after animationDelay
                    // Phase 1: 3 quick blinks
                    // Phase 2: 1 slow final blink  
                    // Phase 3: center fully on, others appear

                    const animTime = Math.max(0, time.current - animationDelay); // Offset by delay
                    const centerIntroEnd = 0.6; // FASTER: reduced from 1.0s
                    let introOpacity = 1;

                    if (isCenterLogo) {
                        if (animTime < 0.4) {
                            // Phase 1: 3 quick blinks (FASTER: 0.07s per half-blink)
                            const blinkPhase = Math.floor(animTime / 0.07);
                            introOpacity = blinkPhase % 2 === 0 ? 0.9 : 0.1;
                        } else if (animTime < 0.6) {
                            // Phase 2: 1 slow final blink (FASTER: 0.2s)
                            const slowBlinkProgress = (animTime - 0.4) / 0.2;
                            if (slowBlinkProgress < 0.5) {
                                introOpacity = 1 - slowBlinkProgress * 2;
                            } else {
                                introOpacity = (slowBlinkProgress - 0.5) * 2;
                            }
                        } else {
                            introOpacity = 1;
                        }
                        // Hide if animation hasn't started yet
                        if (animTime <= 0) introOpacity = 0;
                    } else if (isLogoHex) {
                        // Other hexagons wait for center, then fade in (FASTER)
                        const otherStartTime = centerIntroEnd;
                        const introDelay = distFromCenter * 0.08; // FASTER: reduced from 0.12
                        const introDuration = 0.3; // FASTER: reduced from 0.5
                        const introProgress = Math.max(0, Math.min(1,
                            (animTime - otherStartTime - introDelay) / introDuration
                        ));
                        introOpacity = introProgress;
                    }

                    // Mouse proximity
                    const dx = mouse.current.x - centerX;
                    const dy = mouse.current.y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const isNearMouse = distance < mouseRadius;
                    const mouseGlow = isNearMouse ? Math.pow(1 - distance / mouseRadius, 2) : 0;

                    // Wave pulse: emanates from center (STRONGER)
                    const waveSpeed = 1.5; // how fast the wave travels
                    const waveFrequency = 2; // pulse frequency
                    const wavePhase = distFromCenter * 0.5; // phase offset based on distance
                    const wavePulse = Math.sin(time.current * waveFrequency - wavePhase * waveSpeed) * 0.5 + 0.5; // Increased amplitude

                    // Combined pulse with intro fade (80% to 100% range)
                    const pulse = (wavePulse * 0.2 + 0.8) * introOpacity; // Min 0.8, max 1.0
                    const basePulse = (Math.sin(time.current * 1.5 + col * 0.3 + row * 0.5) + 1) * 0.04;

                    if (isCenterLogo && introOpacity > 0) {
                        // Center hexagon with split glow
                        drawHexagon(
                            centerX,
                            centerY,
                            size * 0.9,
                            `rgba(255, 255, 255, ${0.3 * introOpacity})`,
                            undefined,
                            pulse,
                            { left: `rgba(255, 255, 255, ${0.9 * introOpacity})`, right: `rgba(255, 255, 0, ${0.9 * introOpacity})` }
                        );
                    } else if (isWhiteLogo && introOpacity > 0) {
                        // White ">" hexagons
                        drawHexagon(
                            centerX,
                            centerY,
                            size * 0.9,
                            `rgba(255, 255, 255, ${0.4 * introOpacity})`,
                            `rgba(255, 255, 255, ${0.8 * introOpacity})`,
                            pulse + mouseGlow * 0.5
                        );
                    } else if (isYellowLogo && introOpacity > 0) {
                        // Yellow "<" hexagons
                        drawHexagon(
                            centerX,
                            centerY,
                            size * 0.9,
                            `rgba(255, 255, 0, ${0.4 * introOpacity})`,
                            `rgba(255, 255, 0, ${0.8 * introOpacity})`,
                            pulse + mouseGlow * 0.5
                        );
                    } else {
                        // Regular hexagon - uniform opacity from prop
                        const opacity = baseOpacity + (isNearMouse ? mouseGlow * 0.1 : 0);
                        const color = `rgba(255, 255, 255, ${opacity})`;

                        drawHexagon(
                            centerX,
                            centerY,
                            size * 0.9,
                            color,
                            isNearMouse ? "rgba(255, 255, 0, 0.3)" : undefined,
                            mouseGlow * 0.5
                        );
                    }

                    // DEBUG: Draw coordinate labels in logo area
                    if (debugMode && logoRow >= 0 && logoRow <= 6 && logoCol >= 0 && logoCol <= 10) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                        ctx.font = "10px Arial";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(`${logoRow},${logoCol}`, centerX, centerY);
                    }
                }
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [hexSize, lineWidth, baseOpacity, mouseRadius, showLogo, logoOffsetX, logoOffsetY]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%", height: "100%" }}
        />
    );
}
