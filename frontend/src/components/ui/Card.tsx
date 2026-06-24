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

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export default function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={clsx(
                'rounded-2xl glass-panel p-6',
                hover && 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:translate-y-[-2px]',
                className
            )}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: ReactNode
    className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={clsx('mb-4', className)}>
            {children}
        </div>
    )
}

interface CardTitleProps {
    children: ReactNode
    className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={clsx('text-lg font-semibold text-foreground', className)}>
            {children}
        </h3>
    )
}

interface CardContentProps {
    children: ReactNode
    className?: string
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={clsx('text-muted-foreground', className)}>
            {children}
        </div>
    )
}
