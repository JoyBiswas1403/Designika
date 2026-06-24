/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState, useCallback, useMemo } from 'react'
import { ArrowLeftRight, X, ZoomIn, ZoomOut, Download } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../ui'

interface CompareViewProps {
    version1: {
        id: string
        version: number
        style: string
        imageUrl: string
    }
    version2: {
        id: string
        version: number
        style: string
        imageUrl: string
    }
    onClose: () => void
    onDownload?: (versionId: string) => void
    className?: string
}

type ViewMode = 'side-by-side' | 'slider' | 'fade'

export default function CompareView({
    version1,
    version2,
    onClose,
    onDownload,
    className,
}: CompareViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('slider')
    const [sliderPosition, setSliderPosition] = useState(50)
    const [fadeAmount, setFadeAmount] = useState(50)
    const [zoom, setZoom] = useState(1)
    const [isDragging, setIsDragging] = useState(false)

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging && viewMode !== 'slider') return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }, [isDragging, viewMode])

    const differences = useMemo(() => {
        // Mock difference analysis
        return [
            { label: 'Style', v1: version1.style, v2: version2.style },
            { label: 'Version', v1: `v${version1.version}`, v2: `v${version2.version}` },
        ]
    }, [version1, version2])

    return (
        <div className={clsx('fixed inset-0 z-50 bg-black/90 flex flex-col', className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-white font-semibold">Compare Versions</h2>

                    {/* View mode buttons */}
                    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                        {(['slider', 'side-by-side', 'fade'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={clsx(
                                    'px-3 py-1 rounded text-sm transition-colors',
                                    viewMode === mode
                                        ? 'bg-white text-black'
                                        : 'text-white/70 hover:text-white'
                                )}
                            >
                                {mode === 'side-by-side' ? 'Side by Side' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                        <ZoomOut className="w-4 h-4 text-white" />
                    </Button>
                    <span className="text-white text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                        <ZoomIn className="w-4 h-4 text-white" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5 text-white" />
                    </Button>
                </div>
            </div>

            {/* Comparison area */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                {viewMode === 'side-by-side' ? (
                    <div className="flex gap-4 w-full max-w-6xl">
                        {[version1, version2].map((version) => (
                            <div key={version.id} className="flex-1 space-y-2">
                                <div className="text-center text-white">
                                    <span className="font-medium">Version {version.version}</span>
                                    <span className="text-white/60 ml-2">{version.style}</span>
                                </div>
                                <div className="rounded-xl overflow-hidden">
                                    <img
                                        src={version.imageUrl}
                                        alt={`Version ${version.version}`}
                                        className="w-full"
                                        style={{ transform: `scale(${zoom})` }}
                                    />
                                </div>
                                {onDownload && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => onDownload(version.id)}
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : viewMode === 'slider' ? (
                    <div
                        className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden cursor-ew-resize"
                        onMouseMove={handleMouseMove}
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                    >
                        {/* Version 2 (right/after) */}
                        <img
                            src={version2.imageUrl}
                            alt={`Version ${version2.version}`}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ transform: `scale(${zoom})` }}
                        />

                        {/* Version 1 (left/before) - clipped */}
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                        >
                            <img
                                src={version1.imageUrl}
                                alt={`Version ${version1.version}`}
                                className="w-full h-full object-contain"
                                style={{ transform: `scale(${zoom})` }}
                            />
                        </div>

                        {/* Slider handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white"
                            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <ArrowLeftRight className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-white text-sm">
                            v{version1.version}: {version1.style}
                        </div>
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary-500 text-white text-sm">
                            v{version2.version}: {version2.style}
                        </div>
                    </div>
                ) : (
                    /* Fade mode */
                    <div className="w-full max-w-4xl space-y-4">
                        <div className="relative aspect-video rounded-xl overflow-hidden">
                            <img
                                src={version1.imageUrl}
                                alt={`Version ${version1.version}`}
                                className="absolute inset-0 w-full h-full object-contain"
                                style={{ transform: `scale(${zoom})` }}
                            />
                            <img
                                src={version2.imageUrl}
                                alt={`Version ${version2.version}`}
                                className="absolute inset-0 w-full h-full object-contain"
                                style={{ transform: `scale(${zoom})`, opacity: fadeAmount / 100 }}
                            />

                            {/* Labels */}
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-white text-sm">
                                v{version1.version} → v{version2.version}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-white text-sm">v{version1.version}</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={fadeAmount}
                                onChange={(e) => setFadeAmount(Number(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-white text-sm">v{version2.version}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Differences panel */}
            <div className="p-4 bg-black/50">
                <div className="max-w-4xl mx-auto flex items-center justify-center gap-8">
                    {differences.map((diff) => (
                        <div key={diff.label} className="text-center">
                            <p className="text-white/60 text-xs">{diff.label}</p>
                            <p className="text-white">
                                <span className="opacity-60">{diff.v1}</span>
                                <span className="mx-2">→</span>
                                <span className="font-medium">{diff.v2}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
