/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState, useCallback } from 'react'
import { Eye, EyeOff, Lock, Unlock, Trash2, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../ui'

interface DetectedObject {
    id: string
    label: string
    confidence: number
    bounds: { x: number; y: number; width: number; height: number }
    keep: boolean
    locked: boolean
}

interface ObjectOverlayProps {
    imageUrl: string
    objects: DetectedObject[]
    onObjectToggle: (id: string, keep: boolean) => void
    onObjectLock: (id: string, locked: boolean) => void
    onResetAll: () => void
    disabled?: boolean
    className?: string
}

// Colors for different object types
const OBJECT_COLORS: Record<string, string> = {
    sofa: 'border-blue-500 bg-blue-500/20',
    chair: 'border-green-500 bg-green-500/20',
    table: 'border-yellow-500 bg-yellow-500/20',
    lamp: 'border-purple-500 bg-purple-500/20',
    plant: 'border-emerald-500 bg-emerald-500/20',
    rug: 'border-orange-500 bg-orange-500/20',
    art: 'border-pink-500 bg-pink-500/20',
    window: 'border-cyan-500 bg-cyan-500/20',
    default: 'border-gray-500 bg-gray-500/20',
}

function getObjectColor(label: string): string {
    const key = label.toLowerCase().split(' ')[0]
    return OBJECT_COLORS[key] || OBJECT_COLORS.default
}

export default function ObjectOverlay({
    imageUrl,
    objects,
    onObjectToggle,
    onObjectLock,
    onResetAll,
    disabled = false,
    className,
}: ObjectOverlayProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [showLabels, setShowLabels] = useState(true)

    const handleObjectClick = useCallback((id: string) => {
        if (disabled) return
        setSelectedId(selectedId === id ? null : id)
    }, [disabled, selectedId])

    const keptCount = objects.filter((o) => o.keep).length
    const removedCount = objects.length - keptCount

    return (
        <div className={clsx('space-y-4', className)}>
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                        {objects.length} objects detected
                    </span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            {keptCount} keep
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            {removedCount} remove
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLabels(!showLabels)}
                    >
                        {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="ml-1">Labels</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onResetAll}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                    </Button>
                </div>
            </div>

            {/* Image with overlays */}
            <div className="relative rounded-xl overflow-hidden">
                <img
                    src={imageUrl}
                    alt="Room with detected objects"
                    className="w-full"
                />

                {/* Object bounding boxes */}
                {objects.map((obj) => (
                    <div
                        key={obj.id}
                        onClick={() => handleObjectClick(obj.id)}
                        className={clsx(
                            'absolute border-2 rounded-lg cursor-pointer transition-all duration-200',
                            getObjectColor(obj.label),
                            obj.keep ? 'opacity-100' : 'opacity-50 border-dashed',
                            selectedId === obj.id && 'ring-2 ring-white ring-offset-2',
                            disabled && 'cursor-not-allowed'
                        )}
                        style={{
                            left: `${obj.bounds.x}%`,
                            top: `${obj.bounds.y}%`,
                            width: `${obj.bounds.width}%`,
                            height: `${obj.bounds.height}%`,
                        }}
                    >
                        {/* Label */}
                        {showLabels && (
                            <div
                                className={clsx(
                                    'absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-medium',
                                    'bg-black/70 text-white whitespace-nowrap'
                                )}
                            >
                                {obj.label}
                                {obj.locked && <Lock className="w-3 h-3 inline ml-1" />}
                            </div>
                        )}

                        {/* Keep/Remove indicator */}
                        {!obj.keep && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                                    Will be removed
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Object list */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {objects.map((obj) => (
                    <div
                        key={obj.id}
                        className={clsx(
                            'flex items-center justify-between p-2 rounded-lg border transition-colors',
                            selectedId === obj.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                                : 'border-border bg-card',
                            !obj.keep && 'opacity-60'
                        )}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className={clsx(
                                    'w-3 h-3 rounded-full flex-shrink-0',
                                    obj.keep ? 'bg-green-500' : 'bg-red-500'
                                )}
                            />
                            <span className="text-sm truncate">{obj.label}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onObjectLock(obj.id, !obj.locked)}
                                disabled={disabled}
                                className={clsx(
                                    'p-1 rounded hover:bg-muted transition-colors',
                                    disabled && 'opacity-50 cursor-not-allowed'
                                )}
                                title={obj.locked ? 'Unlock' : 'Lock (sentimental item)'}
                            >
                                {obj.locked ? (
                                    <Lock className="w-4 h-4 text-yellow-500" />
                                ) : (
                                    <Unlock className="w-4 h-4 text-muted-foreground" />
                                )}
                            </button>

                            <button
                                onClick={() => onObjectToggle(obj.id, !obj.keep)}
                                disabled={disabled || obj.locked}
                                className={clsx(
                                    'p-1 rounded transition-colors',
                                    obj.keep
                                        ? 'hover:bg-red-100 dark:hover:bg-red-950'
                                        : 'hover:bg-green-100 dark:hover:bg-green-950',
                                    (disabled || obj.locked) && 'opacity-50 cursor-not-allowed'
                                )}
                                title={obj.keep ? 'Mark for removal' : 'Keep this object'}
                            >
                                {obj.keep ? (
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                ) : (
                                    <RotateCcw className="w-4 h-4 text-green-500" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Instructions */}
            <p className="text-xs text-muted-foreground text-center">
                Click objects to select • Use 🔒 to protect sentimental items • Use 🗑️ to toggle keep/remove
            </p>
        </div>
    )
}
