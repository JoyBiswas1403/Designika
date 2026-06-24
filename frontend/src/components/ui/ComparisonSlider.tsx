/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState, useRef, useEffect, useCallback } from 'react'
import { MoveHorizontal } from 'lucide-react'

interface ComparisonSliderProps {
    before: string
    after: string
    label?: string
}

export default function ComparisonSlider({ before, after, label = "Slide to Reveal" }: ComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMove = useCallback((clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
            const percentage = (x / rect.width) * 100
            setSliderPosition(percentage)
        }
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true)
        // Instant move on click
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
        handleMove(clientX)
    }, [handleMove])

    useEffect(() => {
        const handleWindowMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
            handleMove(clientX)
        }

        const handleWindowUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleWindowMove)
            window.addEventListener('mouseup', handleWindowUp)
            window.addEventListener('touchmove', handleWindowMove, { passive: false })
            window.addEventListener('touchend', handleWindowUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleWindowMove)
            window.removeEventListener('mouseup', handleWindowUp)
            window.removeEventListener('touchmove', handleWindowMove)
            window.removeEventListener('touchend', handleWindowUp)
        }
    }, [isDragging, handleMove])

    return (
        <div
            className="relative w-full h-full select-none group cursor-col-resize"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* Images Container - Clipped */}
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
                <img
                    src={after}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                />
                <div
                    className="absolute inset-0 w-full h-full overflow-hidden border-r border-white/50 backdrop-blur-[2px]"
                    style={{ width: `${sliderPosition}%` }}
                >
                    <img
                        src={before}
                        alt="Before"
                        className="absolute inset-0 w-full h-full object-cover max-w-none select-none"
                        style={{ width: containerRef.current?.offsetWidth || '100%' }}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                    />
                </div>
            </div>

            {/* Handle - Unclipped (sitting on top) */}
            <div
                className="absolute inset-y-0 w-10 -ml-5 flex items-center justify-center pointer-events-none z-10"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className={`w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-transform duration-200 ${isDragging ? 'scale-110 bg-white/30' : 'group-hover:scale-110'}`}>
                    <MoveHorizontal size={14} className="text-white" />
                </div>
            </div>

            {/* Label - Clickable Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent slider move logic
                    setSliderPosition(prev => prev === 100 ? 0 : 100);
                }}
                className="absolute bottom-6 left-6 font-mono text-[10px] tracking-widest text-white/60 uppercase z-20 mix-blend-difference hover:text-white cursor-pointer transition-colors"
            >
                {label}
            </button>
        </div>
    )
}
