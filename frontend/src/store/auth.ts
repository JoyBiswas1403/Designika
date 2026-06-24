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

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, usersApi } from '../lib/api'

interface User {
    id: string
    email: string
    username: string
    profilePicture?: string
    bio?: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    register: (email: string, username: string, password: string) => Promise<void>
    logout: () => void
    fetchUser: () => Promise<void>
    clearError: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await authApi.login({ email, password })
                    set({ token: data.access_token, isAuthenticated: true })
                    await get().fetchUser()
                } catch (err: unknown) {
                    const error = err as { response?: { data?: { detail?: string } } }
                    set({ error: error.response?.data?.detail || 'Login failed' })
                    throw err
                } finally {
                    set({ isLoading: false })
                }
            },

            register: async (email, username, password) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await authApi.register({ email, username, password })
                    set({ token: data.access_token, isAuthenticated: true })
                    await get().fetchUser()
                } catch (err: unknown) {
                    const error = err as { response?: { data?: { detail?: string } } }
                    set({ error: error.response?.data?.detail || 'Registration failed' })
                    throw err
                } finally {
                    set({ isLoading: false })
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false })
            },

            fetchUser: async () => {
                try {
                    const { data } = await usersApi.getMe()
                    set({
                        user: {
                            id: data.id,
                            email: data.email,
                            username: data.username,
                            profilePicture: data.profile_picture || undefined,
                            bio: data.bio || undefined,
                        },
                    })
                } catch {
                    set({ user: null, token: null, isAuthenticated: false })
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
)
