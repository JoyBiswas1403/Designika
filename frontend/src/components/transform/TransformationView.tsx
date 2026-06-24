/**********************************************************************************
 * Copyright (c) 2026 AllCognix AI Technologies Pvt Limited.
 * All rights reserved.
 *
 * This source code is licensed under the terms of the "AllCognix AI License"
 * license found in the LICENSE file in the root directory of this source tree.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * AllCognix AI Technologies Pvt Limited. The intellectual and technical
 * concepts contained herein are proprietary to AllCognix AI Technologies Pvt Limited
 * and are protected by trade secret or copyright law. Dissemination of this
 * information or reproduction of this material is strictly forbidden unless
 * prior written permission is obtained from AllCognix AI Technologies Pvt Limited.
 *
 * Author: Joy BIswas
 * Contact: joy@allcognix.com
 * Date: 30-01-2026
 **********************************************************************************/

import { useState, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, Download, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../ui'

interface TransformationViewProps {
    originalImage: string
    transformedImage: string
    styleName?: string
    onDownload?: () => void
    onRetry?: () => void
    className?: string
}

export default function TransformationView({
    originalImage,
    transformedImage,
    styleName,
    onDownload,
    onRetry,
    className,
}: TransformationViewProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [zoom, setZoom] = useState(1)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }, [isDragging])

    const handleMouseDown = useCallback(() => {
        setIsDragging(true)
    }, [])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!containerRef.current) return

        const touch = e.touches[0]
        const rect = containerRef.current.getBoundingClientRect()
        const x = touch.clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }, [])

    const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.5))
    const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.5))

    return (
        <div className={clsx('space-y-4', className)}>
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Before</span>
                    <div className="w-20 h-1 bg-gradient-to-r from-muted to-primary-500 rounded-full" />
                    <span className="text-sm text-primary-500 font-medium">
                        {styleName || 'After'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground w-12 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>

                    {onRetry && (
                        <Button variant="ghost" size="sm" onClick={onRetry}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    )}

                    {onDownload && (
                        <Button variant="secondary" size="sm" onClick={onDownload}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                        </Button>
                    )}
                </div>
            </div>

            {/* Before/After Slider */}
            <div
                ref={containerRef}
                className="relative aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
            >
                {/* Transformed (After) Image - Full width */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={transformedImage}
                        alt="Transformed"
                        className="w-full h-full object-contain"
                        style={{ transform: `scale(${zoom})` }}
                        draggable={false}
                    />
                </div>

                {/* Original (Before) Image - Clipped */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-full object-contain"
                        style={{ transform: `scale(${zoom})` }}
                        draggable={false}
                    />
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                    {/* Handle circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <div className="flex items-center gap-0.5">
                            <div className="w-1 h-5 bg-gray-400 rounded-full" />
                            <div className="w-1 h-5 bg-gray-400 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
                    Before
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary-500 text-white text-sm font-medium">
                    After
                </div>
            </div>
        </div>
    )
}
