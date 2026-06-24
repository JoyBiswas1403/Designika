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

import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ProcessingStatusProps {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    message?: string
    estimatedSeconds?: number
    className?: string
}

const STATUS_CONFIG = {
    pending: {
        label: 'Queued',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    processing: {
        label: 'Processing',
        color: 'bg-primary-500',
        textColor: 'text-primary-600 dark:text-primary-400',
    },
    completed: {
        label: 'Complete',
        color: 'bg-green-500',
        textColor: 'text-green-600 dark:text-green-400',
    },
    failed: {
        label: 'Failed',
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
    },
}

export default function ProcessingStatus({
    status,
    progress,
    message,
    estimatedSeconds,
    className,
}: ProcessingStatusProps) {
    const config = STATUS_CONFIG[status]
    const isActive = status === 'pending' || status === 'processing'

    return (
        <div className={clsx('rounded-xl border bg-card p-6', className)}>
            <div className="flex items-center gap-4">
                {/* Status indicator */}
                <div className="relative">
                    {isActive ? (
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                        </div>
                    ) : (
                        <div
                            className={clsx(
                                'w-12 h-12 rounded-full flex items-center justify-center',
                                status === 'completed'
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-red-100 dark:bg-red-900/30'
                            )}
                        >
                            {status === 'completed' ? (
                                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>

                {/* Status text */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={clsx('font-semibold', config.textColor)}>
                            {config.label}
                        </span>
                        {isActive && estimatedSeconds && (
                            <span className="text-sm text-muted-foreground">
                                ~{estimatedSeconds}s remaining
                            </span>
                        )}
                    </div>

                    {message && (
                        <p className="text-sm text-muted-foreground mt-1">{message}</p>
                    )}
                </div>

                {/* Progress percentage */}
                <div className="text-2xl font-bold text-foreground">
                    {progress}%
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={clsx(
                            'h-full rounded-full transition-all duration-500 ease-out',
                            config.color,
                            isActive && 'animate-pulse'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Stage indicators */}
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Uploading</span>
                    <span>Analyzing</span>
                    <span>Generating</span>
                    <span>Finishing</span>
                </div>
            </div>
        </div>
    )
}
