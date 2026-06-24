/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Wand2, Image, User, Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useThemeStore } from '../../store/theme'
import { useAuthStore } from '../../store/auth'
import { ChatWidget } from '../chat/ChatWidget'

const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/transform', label: 'Transform', icon: Wand2 },
    { path: '/gallery', label: 'Gallery', icon: Image },
]

export default function AppShell() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { isDark, toggle } = useThemeStore()
    const { isAuthenticated, user } = useAuthStore()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
                <div className="flex items-center justify-between h-16 px-4 md:px-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg hidden sm:block">Interior AI</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                        : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggle}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {isAuthenticated ? (
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                    <nav className="absolute right-0 top-16 bottom-0 w-64 bg-background border-l border-border p-4">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                        : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="pt-16 min-h-screen">
                <Outlet />
            </main>

            <ChatWidget />
        </div>
    )
}
