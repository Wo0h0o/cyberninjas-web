"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

interface ParticleNetworkProps {
    particleCount?: number;
    connectionDistance?: number;
    particleSpeed?: number;
    mouseRadius?: number;
}

export default function ParticleNetwork({
    particleCount = 50,
    connectionDistance = 120,
    particleSpeed = 0.5,
    mouseRadius = 150,
}: ParticleNetworkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: 0, y: 0, active: false });
    const animationFrameId = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initParticles();
        };

        // Initialize particles
        const initParticles = () => {
            particles.current = [];
            for (let i = 0; i < particleCount; i++) {
                particles.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * particleSpeed,
                    vy: (Math.random() - 0.5) * particleSpeed,
                    radius: Math.random() * 2 + 1,
                });
            }
        };

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true,
            };
        };

        const handleMouseLeave = () => {
            mouse.current.active = false;
        };

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.current.forEach((particle, i) => {
                // Mouse attraction
                if (mouse.current.active) {
                    const dx = mouse.current.x - particle.x;
                    const dy = mouse.current.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouseRadius) {
                        const force = (mouseRadius - distance) / mouseRadius;
                        particle.vx += (dx / distance) * force * 0.2;
                        particle.vy += (dy / distance) * force * 0.2;
                    }
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.vx *= -1;
                    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.vy *= -1;
                    particle.y = Math.max(0, Math.min(canvas.height, particle.y));
                }

                // Friction
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(168, 85, 247, 0.8)";
                ctx.fill();

                // Draw connections
                particles.current.slice(i + 1).forEach((otherParticle) => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            });

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
    }, [particleCount, connectionDistance, particleSpeed, mouseRadius]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-auto"
            style={{
                width: "100%",
                height: "100%",
            }}
        />
    );
}
