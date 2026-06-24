/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState, useCallback } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../ui'

interface FilterState {
    search: string
    style: string | null
    roomType: string | null
    sortBy: 'trending' | 'newest' | 'popular' | 'discussed'
    timeRange: 'all' | 'today' | 'week' | 'month'
}

interface GalleryFiltersProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    styles: string[]
    roomTypes: string[]
    className?: string
}

const SORT_OPTIONS = [
    { value: 'trending', label: '🔥 Trending' },
    { value: 'newest', label: '✨ Newest' },
    { value: 'popular', label: '❤️ Most Liked' },
    { value: 'discussed', label: '💬 Most Discussed' },
]

const TIME_OPTIONS = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
]

export default function GalleryFilters({
    filters,
    onFiltersChange,
    styles,
    roomTypes,
    className,
}: GalleryFiltersProps) {
    const [showFilters, setShowFilters] = useState(false)

    const updateFilter = useCallback(
        <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
            onFiltersChange({ ...filters, [key]: value })
        },
        [filters, onFiltersChange]
    )

    const clearFilters = useCallback(() => {
        onFiltersChange({
            search: '',
            style: null,
            roomType: null,
            sortBy: 'trending',
            timeRange: 'all',
        })
    }, [onFiltersChange])

    const activeFilterCount = [
        filters.style,
        filters.roomType,
        filters.sortBy !== 'trending',
        filters.timeRange !== 'all',
    ].filter(Boolean).length

    return (
        <div className={clsx('space-y-4', className)}>
            {/* Main search bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search designs, styles, or creators..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    {filters.search && (
                        <button
                            onClick={() => updateFilter('search', '')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <Button
                    variant={showFilters ? 'primary' : 'secondary'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative"
                >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SORT_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => updateFilter('sortBy', option.value as FilterState['sortBy'])}
                        className={clsx(
                            'px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                            filters.sortBy === option.value
                                ? 'bg-primary-500 text-white'
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                        )}
                    >
                        {option.label}
                    </button>
                ))}

                <div className="h-6 w-px bg-border mx-2" />

                {TIME_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => updateFilter('timeRange', option.value as FilterState['timeRange'])}
                        className={clsx(
                            'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                            filters.timeRange === option.value
                                ? 'bg-muted-foreground/20 text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Expanded filters */}
            {showFilters && (
                <div className="p-4 rounded-xl border bg-card space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Advanced Filters</h4>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-primary-500 hover:underline"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Style filter */}
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Style</label>
                            <select
                                value={filters.style || ''}
                                onChange={(e) => updateFilter('style', e.target.value || null)}
                                className="w-full px-3 py-2 rounded-lg border bg-background"
                            >
                                <option value="">All Styles</option>
                                {styles.map((style) => (
                                    <option key={style} value={style}>
                                        {style}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Room type filter */}
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Room Type</label>
                            <select
                                value={filters.roomType || ''}
                                onChange={(e) => updateFilter('roomType', e.target.value || null)}
                                className="w-full px-3 py-2 rounded-lg border bg-background"
                            >
                                <option value="">All Rooms</option>
                                {roomTypes.map((room) => (
                                    <option key={room} value={room}>
                                        {room}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active filters pills */}
                    {(filters.style || filters.roomType) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {filters.style && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
                                    {filters.style}
                                    <button onClick={() => updateFilter('style', null)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {filters.roomType && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
                                    {filters.roomType}
                                    <button onClick={() => updateFilter('roomType', null)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
