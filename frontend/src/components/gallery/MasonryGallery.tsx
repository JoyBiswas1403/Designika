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

import { useState, useEffect, useRef, useMemo } from 'react'
import { Heart, MessageCircle, Eye, Share2, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface GalleryItem {
    id: string
    imageUrl: string
    title: string
    style: string
    author: {
        id: string
        name: string
        avatarUrl?: string
    }
    likes: number
    comments: number
    views: number
    isLiked?: boolean
    aspectRatio?: number
}

interface MasonryGalleryProps {
    items: GalleryItem[]
    onItemClick?: (item: GalleryItem) => void
    onLike?: (id: string) => void
    onLoadMore?: () => void
    hasMore?: boolean
    isLoading?: boolean
    columns?: number
    gap?: number
    className?: string
}

export default function MasonryGallery({
    items,
    onItemClick,
    onLike,
    onLoadMore,
    hasMore = false,
    isLoading = false,
    columns = 4,
    gap = 16,
    className,
}: MasonryGalleryProps) {
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Infinite scroll observer
    useEffect(() => {
        if (!onLoadMore || !hasMore) return

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                    onLoadMore()
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => observerRef.current?.disconnect()
    }, [onLoadMore, hasMore, isLoading])

    // Distribute items across columns (shortest column first) - use useMemo to prevent infinite loop
    const columnItems = useMemo(() => {
        const cols: GalleryItem[][] = Array.from({ length: columns }, () => [])
        const heights = Array(columns).fill(0)

        items.forEach((item) => {
            const ratio = item.aspectRatio || 0.75 + Math.random() * 0.5
            const shortestCol = heights.indexOf(Math.min(...heights))
            cols[shortestCol].push(item)
            heights[shortestCol] += 1 / ratio
        })

        return cols
    }, [items, columns])

    return (
        <div className={className}>
            {/* Masonry Grid */}
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: `${gap}px`,
                }}
            >
                {columnItems.map((col, colIndex) => (
                    <div key={colIndex} className="flex flex-col" style={{ gap: `${gap}px` }}>
                        {col.map((item) => (
                            <GalleryCard
                                key={item.id}
                                item={item}
                                onClick={() => onItemClick?.(item)}
                                onLike={() => onLike?.(item.id)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Load more trigger */}
            {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading more...</span>
                        </div>
                    ) : (
                        <div className="h-8" /> // Invisible trigger element
                    )}
                </div>
            )}

            {/* Empty state */}
            {items.length === 0 && !isLoading && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">No designs found</p>
                </div>
            )}
        </div>
    )
}

// Individual gallery card
function GalleryCard({
    item,
    onClick,
    onLike,
}: {
    item: GalleryItem
    onClick?: () => void
    onLike?: () => void
}) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className="relative rounded-xl overflow-hidden cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Image */}
            <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />

            {/* Hover overlay */}
            <div
                className={clsx(
                    'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
                    'transition-opacity duration-200',
                    isHovered ? 'opacity-100' : 'opacity-0'
                )}
            >
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                    {/* Title and style */}
                    <h3 className="text-white font-semibold text-lg truncate">{item.title}</h3>
                    <p className="text-white/80 text-sm">{item.style}</p>

                    {/* Author */}
                    <div className="flex items-center gap-2 mt-2">
                        {item.author.avatarUrl ? (
                            <img
                                src={item.author.avatarUrl}
                                alt={item.author.name}
                                className="w-6 h-6 rounded-full"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">
                                {item.author.name[0]}
                            </div>
                        )}
                        <span className="text-white/80 text-sm">{item.author.name}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onLike?.()
                            }}
                            className={clsx(
                                'flex items-center gap-1 transition-colors',
                                item.isLiked ? 'text-red-400' : 'hover:text-red-400'
                            )}
                        >
                            <Heart className={clsx('w-4 h-4', item.isLiked && 'fill-current')} />
                            {item.likes}
                        </button>
                        <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {item.comments}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {item.views}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                // Share functionality
                            }}
                            className="ml-auto hover:text-white"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Style badge (always visible) */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
                {item.style}
            </div>
        </div>
    )
}
