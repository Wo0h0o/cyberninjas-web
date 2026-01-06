'use client'

import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface TreeControlsProps {
    onZoomIn: () => void
    onZoomOut: () => void
    onReset: () => void
}

export function TreeControls({ onZoomIn, onZoomOut, onReset }: TreeControlsProps) {
    return (
        <motion.div
            className="tree-controls"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
        >
            <button
                onClick={onZoomIn}
                className="tree-control-btn"
                aria-label="Zoom in"
            >
                <ZoomIn className="w-5 h-5" />
            </button>
            <button
                onClick={onZoomOut}
                className="tree-control-btn"
                aria-label="Zoom out"
            >
                <ZoomOut className="w-5 h-5" />
            </button>
            <div className="tree-control-divider" />
            <button
                onClick={onReset}
                className="tree-control-btn"
                aria-label="Reset view"
            >
                <Maximize2 className="w-5 h-5" />
            </button>
        </motion.div>
    )
}
