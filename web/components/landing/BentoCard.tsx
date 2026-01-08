"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  showGradient?: boolean;
}

export default function BentoCard({
  children,
  className = "",
  hover = true,
  showGradient = true,
}: BentoCardProps) {
  // Extract debug color from className for borders
  const debugColors: Record<string, string> = {
    'debug-red': '3px solid #ef4444',
    'debug-blue': '3px solid #3b82f6',
    'debug-green': '3px solid #10b981',
    'debug-orange': '3px solid #f59e0b',
    'debug-purple': '3px solid #8b5cf6',
    'debug-pink': '3px solid #ec4899',
    'debug-cyan': '3px solid #06b6d4',
  };

  let borderStyle = '1px solid rgba(255, 255, 255, 0.1)';
  Object.keys(debugColors).forEach(debugClass => {
    if (className.includes(debugClass)) {
      borderStyle = debugColors[debugClass];
    }
  });

  return (
    <motion.div
      className={`relative rounded-3xl overflow-hidden ${className}`}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
      style={{
        background: showGradient
          ? 'linear-gradient(135deg, rgba(28, 28, 35, 1) 0%, rgba(12, 12, 15, 1) 100%)'
          : '#000000',
        border: borderStyle,
      }}
    >
      {children}
    </motion.div>
  );
}
