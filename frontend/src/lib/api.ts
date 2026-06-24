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

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
            const { state } = JSON.parse(authStorage)
            if (state?.token) {
                config.headers.Authorization = `Bearer ${state.token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear auth state and redirect to login
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api

// Auth API
export const authApi = {
    register: (data: { email: string; username: string; password: string }) =>
        api.post<{ access_token: string; refresh_token: string }>('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post<{ access_token: string; refresh_token: string }>('/auth/login', data),

    logout: () => api.post('/auth/logout'),
}

// Users API
export const usersApi = {
    getMe: () => api.get<{
        id: string
        email: string
        username: string
        profile_picture: string | null
        bio: string | null
    }>('/users/me'),

    updateMe: (data: { username?: string; bio?: string }) =>
        api.put('/users/me', data),
}

// Designs API
export const designsApi = {
    list: (params?: { skip?: number; limit?: number }) =>
        api.get('/designs', { params }),

    listPublic: (params?: { skip?: number; limit?: number; style?: string }) =>
        api.get('/designs/public', { params }),

    get: (id: string) => api.get(`/designs/${id}`),

    create: (formData: FormData) =>
        api.post('/designs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    transform: (id: string, data: { style: string; intensity?: number }) =>
        api.post(`/designs/${id}/transform`, data),

    delete: (id: string) => api.delete(`/designs/${id}`),
}

// Transform API
export const transformApi = {
    // Get all available styles
    getStyles: () => api.get<Array<{ key: string; name: string; prompt: string }>>('/transform/styles'),

    // Get style details
    getStyleDetails: (styleKey: string) => api.get(`/transform/styles/${styleKey}`),

    // Get lighting options
    getLightingOptions: () => api.get<Array<{ key: string; name: string; description: string }>>('/transform/lighting'),

    // Get time of day options
    getTimeOptions: () => api.get<Array<{ key: string; name: string; description: string }>>('/transform/time-of-day'),

    // Queue a transformation job
    queueTransform: (data: { design_id: string; style: string; intensity?: number; lighting?: string; time_of_day?: string }) =>
        api.post<{ job_id: string; status: string; estimated_seconds: number }>('/transform/transform', data),

    // Get job status
    getJobStatus: (jobId: string) =>
        api.get<{
            id: string
            job_type: string
            status: 'pending' | 'processing' | 'completed' | 'failed'
            progress: number
            result?: unknown
            error?: string
        }>(`/transform/jobs/${jobId}`),

    // Analyze a design image
    analyzeDesign: (designId: string) =>
        api.post<{
            design_id: string
            analysis: {
                colors: { dominant: Array<{ hex: string; percentage: number }> }
                lighting: { description: string }
                style_recommendations: Array<{ style: string; confidence: number; reason: string }>
            }
        }>('/transform/analyze', { design_id: designId }),

    // Declutter a room image
    declutter: (data: { design_id: string; remove_all?: boolean; items_to_keep?: string[] }) =>
        api.post<{
            success: boolean
            image_b64: string
            mode: string
            is_mock: boolean
            message?: string
        }>('/transform/declutter', data),

    // Analyze clutter in a room
    analyzeClutter: (designId: string) =>
        api.post<{
            design_id: string
            analysis: {
                clutter_score: number
                detected_items: Array<{ name: string; confidence: number; removable: boolean }>
                recommendations: string[]
                is_mock: boolean
            }
        }>('/transform/analyze-clutter', { design_id: designId }),
}

export const inpaintingApi = {
    submit: (formData: FormData) =>
        api.post<{ id: string; status: string }>('/inpainting', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getStatus: (id: string) => api.get<{ status: string; output?: string; error?: string }>(`/inpainting/${id}`),
}
