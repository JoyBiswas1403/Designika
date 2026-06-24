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

import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/theme'

export default function ThemeToggle() {
    const { isDark, toggle } = useThemeStore()

    return (
        <button
            onClick={toggle}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            <div className="relative w-5 h-5">
                <Sun
                    size={20}
                    className={`absolute inset-0 text-amber-500 transition-all duration-500 ${isDark ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}
                />
                <Moon
                    size={20}
                    className={`absolute inset-0 text-cyan-200 transition-all duration-500 ${isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}
                />
            </div>
        </button>
    )
}
