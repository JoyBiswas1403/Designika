/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState, useRef, MouseEvent, TouchEvent } from "react";
import { Sparkles } from "lucide-react";

interface MagicRevealProps {
    beforeImage: string;
    afterImage: string;
    className?: string;
}

export const MagicReveal = ({ beforeImage, afterImage, className = "" }: MagicRevealProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = useState(false);

    const updatePosition = (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        // Clamp values between 0 and 100
        setLensPosition({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        setIsHovering(true);
        updatePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
        setIsHovering(true);
        // Prevent scrolling while interacting
        // e.preventDefault(); 
        if (e.touches.length > 0) {
            updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full aspect-video rounded-3xl overflow-hidden cursor-none shadow-2xl border border-white/10 ${className}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onTouchStart={() => setIsHovering(true)}
            onTouchEnd={() => setIsHovering(false)}
        >
            {/* Background Layer (Before Image - "Boring Grey") */}
            <img
                src={beforeImage}
                alt="Original Room"
                className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-75 brightness-90"
            />

            {/* Prompt Overlay (Only visible when not hovering) */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 animate-pulse">
                    <Sparkles size={18} className="text-amber-400" />
                    <span className="text-sm font-medium">Hover to Reveal Design</span>
                </div>
            </div>

            {/* Magic Lens Layer (After Image - "Vibrant") */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    maskImage: `radial-gradient(circle ${isHovering ? '150px' : '0px'} at ${lensPosition.x}% ${lensPosition.y}%, black 100%, transparent 100%)`,
                    WebkitMaskImage: `radial-gradient(circle ${isHovering ? '150px' : '0px'} at ${lensPosition.x}% ${lensPosition.y}%, black 100%, transparent 100%)`,
                    transition: 'mask-image 0.1s ease, -webkit-mask-image 0.1s ease' // Smooth transition for mask
                }}
            >
                <img
                    src={afterImage}
                    alt="Designed Room"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Lens Border/Glow Ring */}
            {isHovering && (
                <div
                    className="absolute pointer-events-none rounded-full border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.3)] backdrop-blur-[1px]"
                    style={{
                        width: '300px', // 2x lens size to match radial gradient diameter
                        height: '300px',
                        left: `${lensPosition.x}%`,
                        top: `${lensPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 50px 10px rgba(255, 255, 255, 0.1) inset, 0 0 20px rgba(255, 255, 255, 0.3)'
                    }}
                ></div>
            )}
        </div>
    );
};
