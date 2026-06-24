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

import { useState } from 'react'
import { Clock, GitBranch, Eye, Download, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../ui'

interface DesignVersion {
    id: string
    version: number
    style: string
    createdAt: string
    thumbnailUrl: string
    isCurrent: boolean
    parentId?: string
}

interface VersionTimelineProps {
    versions: DesignVersion[]
    currentVersionId: string
    onVersionSelect: (id: string) => void
    onVersionRestore: (id: string) => void
    onVersionDownload: (id: string) => void
    onCompare?: (id1: string, id2: string) => void
    className?: string
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

export default function VersionTimeline({
    versions,
    currentVersionId,
    onVersionSelect,
    onVersionRestore,
    onVersionDownload,
    onCompare,
    className,
}: VersionTimelineProps) {
    const [expanded, setExpanded] = useState(true)
    const [compareMode, setCompareMode] = useState(false)
    const [selectedForCompare, setSelectedForCompare] = useState<string | null>(null)

    const handleVersionClick = (id: string) => {
        if (compareMode) {
            if (selectedForCompare === null) {
                setSelectedForCompare(id)
            } else if (selectedForCompare !== id) {
                onCompare?.(selectedForCompare, id)
                setCompareMode(false)
                setSelectedForCompare(null)
            }
        } else {
            onVersionSelect(id)
        }
    }

    const sortedVersions = [...versions].sort((a, b) => b.version - a.version)

    return (
        <div className={clsx('rounded-xl border bg-card', className)}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold">Version History</h3>
                    <span className="text-sm text-muted-foreground">
                        ({versions.length} versions)
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {onCompare && (
                        <Button
                            variant={compareMode ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                setCompareMode(!compareMode)
                                setSelectedForCompare(null)
                            }}
                        >
                            <GitBranch className="w-4 h-4 mr-1" />
                            Compare
                        </Button>
                    )}
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Compare mode instructions */}
            {compareMode && expanded && (
                <div className="px-4 pb-2">
                    <p className="text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-3 py-2 rounded-lg">
                        {selectedForCompare
                            ? '👆 Now select the second version to compare'
                            : '👆 Select the first version to compare'}
                    </p>
                </div>
            )}

            {/* Timeline */}
            {expanded && (
                <div className="px-4 pb-4 space-y-2 max-h-[400px] overflow-y-auto">
                    {sortedVersions.map((version, index) => (
                        <div
                            key={version.id}
                            className={clsx(
                                'relative flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer',
                                'border',
                                version.id === currentVersionId
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                                    : 'border-transparent hover:border-border hover:bg-muted/50',
                                compareMode && selectedForCompare === version.id && 'ring-2 ring-primary-500'
                            )}
                            onClick={() => handleVersionClick(version.id)}
                        >
                            {/* Timeline line */}
                            {index < sortedVersions.length - 1 && (
                                <div className="absolute left-[26px] top-[48px] w-0.5 h-6 bg-border" />
                            )}

                            {/* Version indicator */}
                            <div
                                className={clsx(
                                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                    version.id === currentVersionId
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                {version.version}
                            </div>

                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                <img
                                    src={version.thumbnailUrl}
                                    alt={`Version ${version.version}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{version.style}</span>
                                    {version.isCurrent && (
                                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formatTimeAgo(version.createdAt)}
                                </p>
                            </div>

                            {/* Actions */}
                            {!compareMode && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onVersionSelect(version.id)
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                    </button>

                                    {!version.isCurrent && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onVersionRestore(version.id)
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                            title="Restore this version"
                                        >
                                            <RotateCcw className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onVersionDownload(version.id)
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
