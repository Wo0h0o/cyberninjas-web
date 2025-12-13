"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface TypingEffectProps {
    text: string;
    className?: string;
    speed?: number;
    highlightWords?: string[];
    onComplete?: () => void;
}

export function TypingEffect({
    text,
    className = "",
    speed = 50,
    highlightWords = [],
    onComplete,
}: TypingEffectProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (!isComplete) {
            setIsComplete(true);
            if (onComplete) {
                onComplete();
            }
        }
    }, [currentIndex, text, speed, onComplete, isComplete]);

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
        <span className={className}>
            {renderedText}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: showCursor ? 1 : 0 }}
                    className="inline-block w-[3px] h-[0.8em] bg-purple-400 ml-1 align-middle"
                />
            )}
        </span>
    );
}
