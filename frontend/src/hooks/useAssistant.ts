/**
 * useAssistant - Orchestrator Hook (Jarvis Mode)
 * Connects wake-word voice, camera, and API for hands-free control.
 * Handles 29 voice command actions for FULL unlimited UI control.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../store/theme'
import { useDesignStore } from '../store/design'
import { useAuthStore } from '../store/auth'
import api from '../lib/api'

interface Message {
    role: 'user' | 'model'
    content: string
    image?: string
}

interface AssistantAction {
    action: string
    params: Record<string, any>
}

interface UseAssistantReturn {
    messages: Message[]
    isProcessing: boolean
    send: (text: string, imageBase64?: string) => Promise<any>
    lastActions: AssistantAction[]
    clearMessages: () => void
}

export function useAssistant(): UseAssistantReturn {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hi, I'm Designika! Say **\"Hey Designika\"** to activate me. I can control everything — navigation, design generation, styles, lighting, creativity, zoom, sidebars, eraser, upload, download, theme, and much more. All hands-free! 🎙️" }
    ])
    const [isProcessing, setIsProcessing] = useState(false)
    const [lastActions, setLastActions] = useState<AssistantAction[]>([])
    const processingRef = useRef(false)

    const navigate = useNavigate()
    const { toggle: toggleTheme, setDark } = useThemeStore()
    const { setStyle, setRoomType, setPrompt } = useDesignStore()
    const { user, logout } = useAuthStore()

    // Prevent double-processing
    useEffect(() => {
        processingRef.current = isProcessing
    }, [isProcessing])

    // Execute actions returned by the backend
    const executeActions = useCallback((actions: AssistantAction[]) => {
        for (const { action, params } of actions) {
            switch (action) {
                // ──────── NAVIGATION ────────
                case 'navigate': {
                    const routes: Record<string, string> = {
                        home: '/',
                        gallery: '/gallery',
                        history: '/history',
                        profile: user ? `/profile/${user.id}` : '/profile',
                        transform: '/transform',
                        login: '/login',
                        register: '/register',
                        pricing: '/pricing'
                    }
                    const route = routes[params.page] || '/'
                    navigate(route)
                    break
                }
                case 'go_back': {
                    navigate(-1)
                    break
                }

                // ──────── DESIGN GENERATION ────────
                case 'generate_design': {
                    if (params.style) setStyle(params.style)
                    if (params.room_type) setRoomType(params.room_type)
                    navigate('/transform')
                    break
                }
                case 'set_room_type': {
                    if (params.room_type) setRoomType(params.room_type)
                    break
                }
                case 'set_style': {
                    if (params.style) setStyle(params.style)
                    break
                }
                case 'set_prompt': {
                    if (params.prompt) setPrompt(params.prompt)
                    break
                }
                case 'set_lighting': {
                    window.dispatchEvent(new CustomEvent('designika:set-lighting', { detail: params.lighting }))
                    break
                }
                case 'set_creativity': {
                    window.dispatchEvent(new CustomEvent('designika:set-creativity', { detail: params.level }))
                    break
                }
                case 'start_transform': {
                    window.dispatchEvent(new CustomEvent('designika:generate'))
                    break
                }

                // ──────── THEME ────────
                case 'toggle_theme': {
                    toggleTheme()
                    break
                }
                case 'set_dark_mode': {
                    setDark(params.enabled)
                    break
                }

                // ──────── AUTH ────────
                case 'logout': {
                    logout()
                    navigate('/login')
                    break
                }

                // ──────── GALLERY/SEARCH ────────
                case 'search_designs': {
                    navigate('/gallery')
                    break
                }

                // ──────── FILE/IMAGE ────────
                case 'upload_image': {
                    navigate('/transform')
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('designika:upload'))
                    }, 500)
                    break
                }
                case 'download_image': {
                    window.dispatchEvent(new CustomEvent('designika:download'))
                    break
                }
                case 'reset_design': {
                    window.dispatchEvent(new CustomEvent('designika:reset'))
                    break
                }

                // ──────── STUDIO UI ────────
                case 'toggle_sidebar': {
                    window.dispatchEvent(new CustomEvent('designika:toggle-sidebar', { detail: params.side }))
                    break
                }
                case 'toggle_eraser': {
                    window.dispatchEvent(new CustomEvent('designika:toggle-eraser'))
                    break
                }
                case 'zoom': {
                    window.dispatchEvent(new CustomEvent('designika:zoom', { detail: params.direction }))
                    break
                }

                // ──────── PAGE CONTROLS ────────
                case 'scroll_page': {
                    const dir = params.direction || 'down'
                    if (dir === 'top') {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    } else if (dir === 'bottom') {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                    } else if (dir === 'up') {
                        window.scrollBy({ top: -500, behavior: 'smooth' })
                    } else {
                        window.scrollBy({ top: 500, behavior: 'smooth' })
                    }
                    break
                }
                case 'toggle_fullscreen': {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => { })
                    } else {
                        document.documentElement.requestFullscreen().catch(() => { })
                    }
                    break
                }
                case 'refresh_page': {
                    window.location.reload()
                    break
                }

                // ──────── MISC ────────
                case 'show_help':
                case 'open_chat':
                case 'get_credits':
                case 'remember_preference':
                case 'recall_preferences':
                case 'analyze_room':
                    // These are handled by the backend reply text, no frontend action needed
                    break

                default:
                    console.warn('Unknown action:', action, params)
                    break
            }
        }
    }, [navigate, toggleTheme, setDark, setStyle, setRoomType, setPrompt, logout, user])

    const send = useCallback(async (text: string, imageBase64?: string): Promise<any> => {
        if (processingRef.current) return null
        if (!text.trim() && !imageBase64) return null
        setIsProcessing(true)

        // Add user message
        const userMsg: Message = { role: 'user', content: text }
        if (imageBase64) userMsg.image = '📸 [Photo attached]'
        setMessages(prev => [...prev, userMsg])

        try {
            const history = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }))

            const { data } = await api.post('/assistant', {
                message: text,
                image_base64: imageBase64 || null,
                history,
                user_id: user?.id || null
            })

            // Add assistant reply
            setMessages(prev => [...prev, { role: 'model', content: data.reply }])

            // Execute actions
            if (data.actions && data.actions.length > 0) {
                setLastActions(data.actions)
                executeActions(data.actions)
            }

            return data
        } catch (error: any) {
            console.error('Assistant error:', error)
            setMessages(prev => [...prev, {
                role: 'model',
                content: "I'm having trouble connecting right now. Please try again."
            }])
            return null
        } finally {
            setIsProcessing(false)
        }
    }, [messages, user, executeActions])

    const clearMessages = useCallback(() => {
        setMessages([
            { role: 'model', content: "Conversation cleared! Say **\"Hey Designika\"** or click the mic to start." }
        ])
        setLastActions([])
    }, [])

    return {
        messages,
        isProcessing,
        send,
        lastActions,
        clearMessages
    }
}
