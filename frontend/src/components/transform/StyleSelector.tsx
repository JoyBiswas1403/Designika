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

import { useState, useEffect } from 'react'
import { Check, Sparkles, Sun, Moon, Sunrise, Sunset, Flame, Snowflake, Theater, Cloud } from 'lucide-react'
import clsx from 'clsx'
import { transformApi } from '../../lib/api'

interface Style {
    key: string
    name: string
    prompt: string
}

interface StyleSelectorProps {
    selectedStyle: string | null
    onStyleSelect: (styleKey: string) => void
    intensity: number
    onIntensityChange: (intensity: number) => void
    lighting: string
    onLightingChange: (lighting: string) => void
    timeOfDay: string
    onTimeOfDayChange: (time: string) => void
    disabled?: boolean
}

// Style preview images (placeholder gradients for now)
const STYLE_COLORS: Record<string, string> = {
    modern_minimalist: 'from-gray-100 to-gray-300',
    scandinavian: 'from-amber-50 to-amber-200',
    industrial: 'from-stone-400 to-stone-600',
    mid_century_modern: 'from-orange-200 to-amber-400',
    bohemian: 'from-rose-300 to-purple-400',
    contemporary: 'from-slate-200 to-slate-400',
    traditional: 'from-amber-700 to-amber-900',
    coastal: 'from-sky-200 to-blue-400',
    farmhouse: 'from-amber-100 to-stone-300',
    art_deco: 'from-yellow-400 to-gray-800',
    japanese_zen: 'from-stone-200 to-emerald-300',
    eclectic: 'from-pink-300 via-yellow-300 to-cyan-300',
    maximalist: 'from-fuchsia-400 via-violet-400 to-cyan-400',
    biophilic: 'from-green-300 to-emerald-500',
    transitional: 'from-neutral-200 to-neutral-400',
}

const LIGHTING_OPTIONS = [
    { key: 'natural', name: 'Natural', icon: Sun, color: 'text-yellow-500' },
    { key: 'warm', name: 'Warm', icon: Flame, color: 'text-orange-500' },
    { key: 'cool', name: 'Cool', icon: Snowflake, color: 'text-blue-400' },
    { key: 'dramatic', name: 'Dramatic', icon: Theater, color: 'text-purple-500' },
    { key: 'soft', name: 'Soft', icon: Cloud, color: 'text-gray-400' },
]

const TIME_OPTIONS = [
    { key: 'morning', name: 'Morning', icon: Sunrise, color: 'text-amber-400' },
    { key: 'afternoon', name: 'Afternoon', icon: Sun, color: 'text-yellow-500' },
    { key: 'evening', name: 'Evening', icon: Sunset, color: 'text-orange-500' },
    { key: 'night', name: 'Night', icon: Moon, color: 'text-indigo-400' },
]

export default function StyleSelector({
    selectedStyle,
    onStyleSelect,
    intensity,
    onIntensityChange,
    lighting,
    onLightingChange,
    timeOfDay,
    onTimeOfDayChange,
    disabled = false,
}: StyleSelectorProps) {
    const [styles, setStyles] = useState<Style[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStyles = async () => {
            try {
                const { data } = await transformApi.getStyles()
                setStyles(data)
            } catch (error) {
                console.error('Failed to fetch styles:', error)
                // Fallback styles
                setStyles([
                    { key: 'modern_minimalist', name: 'Modern Minimalist', prompt: '' },
                    { key: 'scandinavian', name: 'Scandinavian', prompt: '' },
                    { key: 'industrial', name: 'Industrial', prompt: '' },
                    { key: 'bohemian', name: 'Bohemian', prompt: '' },
                    { key: 'coastal', name: 'Coastal', prompt: '' },
                    { key: 'farmhouse', name: 'Farmhouse', prompt: '' },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchStyles()
    }, [])

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-32"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-muted rounded-xl"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Style Grid */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    Choose a Style
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {styles.map((style) => (
                        <button
                            key={style.key}
                            onClick={() => onStyleSelect(style.key)}
                            disabled={disabled}
                            className={clsx(
                                'relative aspect-square rounded-xl overflow-hidden transition-all duration-200',
                                'group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                                selectedStyle === style.key
                                    ? 'ring-2 ring-primary-500 ring-offset-2'
                                    : 'hover:scale-105',
                                disabled && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            {/* Gradient background */}
                            <div
                                className={clsx(
                                    'absolute inset-0 bg-gradient-to-br',
                                    STYLE_COLORS[style.key] || 'from-gray-200 to-gray-400'
                                )}
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Style name */}
                            <div className="absolute inset-x-0 bottom-0 p-2">
                                <span className="text-white text-sm font-medium drop-shadow-lg">
                                    {style.name}
                                </span>
                            </div>

                            {/* Selected indicator */}
                            {selectedStyle === style.key && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lighting Selection */}
            <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Lighting</h4>
                <div className="flex flex-wrap gap-2">
                    {LIGHTING_OPTIONS.map((option) => {
                        const Icon = option.icon
                        return (
                            <button
                                key={option.key}
                                onClick={() => onLightingChange(option.key)}
                                disabled={disabled}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                                    lighting === option.key
                                        ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                        : 'border-border hover:border-primary-500/50 text-muted-foreground hover:text-foreground',
                                    disabled && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <Icon className={clsx('w-4 h-4', lighting === option.key ? option.color : '')} />
                                <span className="text-sm">{option.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Time of Day Selection */}
            <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Time of Day</h4>
                <div className="flex flex-wrap gap-2">
                    {TIME_OPTIONS.map((option) => {
                        const Icon = option.icon
                        return (
                            <button
                                key={option.key}
                                onClick={() => onTimeOfDayChange(option.key)}
                                disabled={disabled}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                                    timeOfDay === option.key
                                        ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                        : 'border-border hover:border-primary-500/50 text-muted-foreground hover:text-foreground',
                                    disabled && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <Icon className={clsx('w-4 h-4', timeOfDay === option.key ? option.color : '')} />
                                <span className="text-sm">{option.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Intensity Slider */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">
                        Style Intensity
                    </label>
                    <span className="text-sm text-muted-foreground">
                        {Math.round(intensity * 100)}%
                    </span>
                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity * 100}
                    onChange={(e) => onIntensityChange(Number(e.target.value) / 100)}
                    disabled={disabled}
                    className={clsx(
                        'w-full h-2 bg-muted rounded-full appearance-none cursor-pointer',
                        'accent-primary-500',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                />

                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Subtle</span>
                    <span>Balanced</span>
                    <span>Strong</span>
                </div>
            </div>
        </div>
    )
}

