/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './store/theme'
import { useAuthStore } from './store/auth'
import { DesignikaAssistant } from './components/assistant/DesignikaAssistant'
import HomePage from './pages/HomePage'
import TransformPage from './pages/TransformPage'
import GalleryPage from './pages/GalleryPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

export default function App() {
    const { isDark } = useThemeStore()
    const { token, user, fetchUser } = useAuthStore()

    useEffect(() => {
        // Rehydrate user session if we have a token but no user data
        if (token && !user) {
            fetchUser().catch(console.error)
        }
    }, [token, user, fetchUser])

    return (
        <div style={{ colorScheme: isDark ? 'dark' : 'light' }}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/transform" element={<TransformPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <DesignikaAssistant />
        </div>
    )
}
