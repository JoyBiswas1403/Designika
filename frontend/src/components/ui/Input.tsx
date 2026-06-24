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

import { forwardRef, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={clsx(
                        'w-full px-3 py-2 rounded-lg border transition-colors duration-200',
                        'bg-background text-foreground placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        error ? 'border-red-500' : 'border-input hover:border-primary-300',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
