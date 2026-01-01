"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface TypingEffectProps {
    text: string;
    className?: string;
    speed?: number;
    highlightWords?: string[];
    onComplete?: () => void;
    slamEffect?: boolean;
}

export function TypingEffect({
    text,
    className = "",
    speed = 50,
    highlightWords = [],
    onComplete,
    slamEffect = false,
}: TypingEffectProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [showSlam, setShowSlam] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (!isComplete) {
            setIsComplete(true);
            if (slamEffect) {
                // Trigger slam effect after a brief delay
                setTimeout(() => {
                    setShowSlam(true);
                }, 100);
            }
            if (onComplete) {
                onComplete();
            }
        }
    }, [currentIndex, text, speed, onComplete, isComplete, slamEffect]);

    // Cursor blink
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Render text with highlights
    const renderedText = useMemo(() => {
        if (highlightWords.length === 0) {
            return <span>{displayedText}</span>;
        }

        // Create regex to find highlight words
        const regex = new RegExp(`(${highlightWords.join("|")})`, "gi");
        const parts = displayedText.split(regex);

        return parts.map((part, index) => {
            const isHighlight = highlightWords.some(
                (word) => word.toLowerCase() === part.toLowerCase()
            );
            if (isHighlight) {
                return (
                    <span key={index} className="gradient-text">
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    }, [displayedText, highlightWords]);

    return (
        <motion.span
            className={className}
            animate={
                showSlam
                    ? {
                        scale: [1, 1.05, 1],
                        y: [0, -5, 0],
                    }
                    : {}
            }
            transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1], // Spring easing
            }}
            style={{
                display: "inline-block",
                textShadow: showSlam
                    ? "0 0 30px rgba(168, 85, 247, 0.5)"
                    : "none",
            }}
        >
            {renderedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: showCursor ? 1 : 0 }}
                    className="inline-block w-[3px] h-[0.8em] bg-purple-400 ml-1 align-middle"
                />
            )}
        </motion.span>
    );
}
