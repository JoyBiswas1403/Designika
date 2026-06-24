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

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
    className?: string
}

export const Modal = ({ isOpen, onClose, children, title, className }: ModalProps) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={clsx(
                    "relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem]",
                    "bg-[#0a0a0a] border border-white/10 shadow-2xl",
                    "animate-in fade-in zoom-in-95 duration-200",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h3 className="text-lg font-serif font-medium text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-white/80">
                    {children}
                </div>
            </div>
        </div>
    )
}
