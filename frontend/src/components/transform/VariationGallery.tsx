/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState } from 'react'
import { Check, Star, Download, Eye } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../ui'

interface Variation {
    index: number
    image_b64: string
    quality?: {
        overall: number
        resolution?: number
        aspect_ratio?: number
        color_diversity?: number
    }
    is_mock?: boolean
}

interface VariationGalleryProps {
    variations: Variation[]
    selectedIndex: number | null
    onSelect: (index: number) => void
    onPreview?: (variation: Variation) => void
    onDownload?: (variation: Variation) => void
    className?: string
}

export default function VariationGallery({
    variations,
    selectedIndex,
    onSelect,
    onPreview,
    onDownload,
    className,
}: VariationGalleryProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    if (variations.length === 0) {
        return null
    }

    return (
        <div className={clsx('space-y-4', className)}>
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Generated Variations
                <span className="text-sm font-normal text-muted-foreground">
                    ({variations.length} options)
                </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {variations.map((variation) => (
                    <div
                        key={variation.index}
                        className={clsx(
                            'relative rounded-xl overflow-hidden transition-all duration-200 group cursor-pointer',
                            selectedIndex === variation.index
                                ? 'ring-2 ring-primary-500 ring-offset-2'
                                : 'hover:ring-2 hover:ring-primary-300 hover:ring-offset-1'
                        )}
                        onClick={() => onSelect(variation.index)}
                        onMouseEnter={() => setHoveredIndex(variation.index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Image */}
                        <div className="aspect-square">
                            <img
                                src={`data:image/jpeg;base64,${variation.image_b64}`}
                                alt={`Variation ${variation.index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Selected indicator */}
                        {selectedIndex === variation.index && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}

                        {/* Quality score badge */}
                        {variation.quality && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-medium">
                                {variation.quality.overall.toFixed(0)}% quality
                            </div>
                        )}

                        {/* Hover overlay */}
                        {hoveredIndex === variation.index && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 animate-fade-in">
                                {onPreview && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onPreview(variation)
                                        }}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                )}
                                {onDownload && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDownload(variation)
                                        }}
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Variation number */}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs">
                            #{variation.index + 1}
                        </div>

                        {/* Mock indicator */}
                        {variation.is_mock && (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-yellow-500/80 text-black text-xs font-medium">
                                Preview
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Selection info */}
            {selectedIndex !== null && (
                <p className="text-sm text-muted-foreground text-center">
                    Variation #{selectedIndex + 1} selected. Click another to compare.
                </p>
            )}
        </div>
    )
}
