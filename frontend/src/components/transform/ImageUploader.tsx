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
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ImageUploaderProps {
    onImageSelect: (file: File) => void
    onImageClear?: () => void
    isUploading?: boolean
    maxSize?: number // in MB
    acceptedTypes?: string[]
    className?: string
}

export default function ImageUploader({
    onImageSelect,
    onImageClear,
    isUploading = false,
    maxSize = 10,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    className,
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const validateFile = useCallback((file: File): boolean => {
        setError(null)

        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            setError('Invalid file type. Please upload JPG, PNG, or WebP.')
            return false
        }

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File too large. Maximum size is ${maxSize}MB.`)
            return false
        }

        return true
    }, [acceptedTypes, maxSize])

    const handleFile = useCallback((file: File) => {
        if (!validateFile(file)) return

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        onImageSelect(file)
    }, [validateFile, onImageSelect])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handleClear = useCallback(() => {
        setPreview(null)
        setError(null)
        if (inputRef.current) inputRef.current.value = ''
        onImageClear?.()
    }, [onImageClear])

    const handleClick = useCallback(() => {
        if (!preview && !isUploading) {
            inputRef.current?.click()
        }
    }, [preview, isUploading])

    return (
        <div className={clsx('relative', className)}>
            <input
                ref={inputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleInputChange}
                className="hidden"
            />

            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={clsx(
                    'relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden',
                    'min-h-[300px] flex items-center justify-center',
                    preview ? 'border-transparent' : 'cursor-pointer',
                    isDragging
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                        : 'border-border hover:border-primary-400 hover:bg-muted/50',
                    isUploading && 'pointer-events-none opacity-70'
                )}
            >
                {preview ? (
                    <>
                        {/* Preview Image */}
                        <img
                            src={preview}
                            alt="Upload preview"
                            className="w-full h-full object-contain max-h-[500px]"
                        />

                        {/* Clear button */}
                        {!isUploading && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClear()
                                }}
                                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {/* Uploading overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3 text-white">
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                    <span className="font-medium">Uploading...</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                        <div
                            className={clsx(
                                'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
                                isDragging
                                    ? 'bg-primary-100 dark:bg-primary-900'
                                    : 'bg-muted'
                            )}
                        >
                            {isDragging ? (
                                <Upload className="w-8 h-8 text-primary-500" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>

                        <div>
                            <p className="text-lg font-medium text-foreground">
                                {isDragging ? 'Drop your image here' : 'Drag & drop your room photo'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                or click to browse
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {['JPG', 'PNG', 'WebP'].map((format) => (
                                <span
                                    key={format}
                                    className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                                >
                                    {format}
                                </span>
                            ))}
                            <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                Max {maxSize}MB
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400 text-center">
                    {error}
                </p>
            )}
        </div>
    )
}
