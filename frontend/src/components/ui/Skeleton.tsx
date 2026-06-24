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

import clsx from 'clsx'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
    animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
    className,
    variant = 'text',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    return (
        <div
            className={clsx(
                'bg-muted',
                animation === 'pulse' && 'animate-pulse',
                animation === 'wave' && 'animate-shimmer',
                variant === 'circular' && 'rounded-full',
                variant === 'rectangular' && 'rounded-lg',
                variant === 'text' && 'rounded h-4',
                className
            )}
            style={{ width, height }}
        />
    )
}

// Common skeleton patterns
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={clsx('rounded-xl border p-4 space-y-3', className)}>
            <Skeleton variant="rectangular" height={200} className="w-full" />
            <Skeleton width="60%" />
            <Skeleton width="40%" />
            <div className="flex gap-2 pt-2">
                <Skeleton variant="circular" width={32} height={32} />
                <div className="flex-1 space-y-1">
                    <Skeleton width="30%" />
                    <Skeleton width="20%" />
                </div>
            </div>
        </div>
    )
}

export function GallerySkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* Cover */}
            <Skeleton variant="rectangular" height={200} className="w-full" />

            {/* Avatar and info */}
            <div className="flex gap-4 -mt-12 px-4">
                <Skeleton variant="circular" width={100} height={100} />
                <div className="pt-14 space-y-2 flex-1">
                    <Skeleton width="30%" height={24} />
                    <Skeleton width="20%" />
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 px-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center space-y-1">
                        <Skeleton width={40} height={24} className="mx-auto" />
                        <Skeleton width={60} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ChatSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {/* Assistant message */}
            <div className="flex gap-2">
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="rectangular" width="60%" height={60} />
            </div>

            {/* User message */}
            <div className="flex gap-2 justify-end">
                <Skeleton variant="rectangular" width="40%" height={40} />
            </div>

            {/* Loading indicator */}
            <div className="flex gap-2">
                <Skeleton variant="circular" width={32} height={32} />
                <div className="flex gap-1 items-center">
                    <Skeleton variant="circular" width={8} height={8} />
                    <Skeleton variant="circular" width={8} height={8} />
                    <Skeleton variant="circular" width={8} height={8} />
                </div>
            </div>
        </div>
    )
}

export default Skeleton
