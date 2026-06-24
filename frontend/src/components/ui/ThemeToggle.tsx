/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
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
