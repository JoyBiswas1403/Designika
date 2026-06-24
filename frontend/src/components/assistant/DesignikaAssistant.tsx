/**********************************************************************************
 * Designika AI Assistant - Siri/Jarvis Mode
 * 
 * No chat box. No text input. Just voice.
 * - Floating orb always visible (bottom-right)
 * - Auto-listens for "Hey Designika" on page load
 * - When activated: compact side bubble appears above the orb
 * - Shows transcript + response briefly, then fades away
 * - Controls the entire app hands-free
 * 
 * CRITICAL: The state machine in useVoice handles all listen/speak timing.
 * This component MUST NOT restart recognition or interfere with TTS timing.
 **********************************************************************************/

import React, { useState, useEffect, useRef } from 'react'
import { Mic, Sparkles, Volume2, Loader2, Eye } from 'lucide-react'
import { useVoice } from '../../hooks/useVoice'
import { useCamera } from '../../hooks/useCamera'
import { useAssistant } from '../../hooks/useAssistant'

type VisualState = 'sleeping' | 'listening' | 'thinking' | 'speaking'

export const DesignikaAssistant: React.FC = () => {
    const [showBubble, setShowBubble] = useState(false)
    const [displayText, setDisplayText] = useState('')
    const [responseText, setResponseText] = useState('')
    const [ttsEnabled] = useState(true)
    const fadeTimerRef = useRef<any>(null)
    const lastProcessedRef = useRef('')
    const isCommandRunningRef = useRef(false)

    const voice = useVoice()
    const camera = useCamera()
    const assistant = useAssistant()

    const getVisualState = (): VisualState => {
        if (voice.isSpeaking) return 'speaking'
        if (assistant.isProcessing) return 'thinking'
        if (voice.mode === 'active') return 'listening'
        return 'sleeping'
    }
    const visualState = getVisualState()

    // When wake word activates → show bubble
    useEffect(() => {
        if (voice.mode === 'active') {
            setShowBubble(true)
            setDisplayText('')
            setResponseText('')
            clearAutoHide()
        }
    }, [voice.mode === 'active'])

    // Show live transcript while user is speaking
    useEffect(() => {
        if (voice.transcript && voice.mode === 'active' && !voice.isSpeaking) {
            setDisplayText(voice.transcript)
        }
    }, [voice.transcript])

    // ═══════════════════════════════════════════════════════
    // PROCESS FINAL COMMAND
    // finalTranscript only fires after 1.5s of silence
    // This is the ONLY place where commands get sent to the API
    // ═══════════════════════════════════════════════════════
    useEffect(() => {
        if (
            voice.finalTranscript &&
            voice.mode === 'active' &&
            !voice.isSpeaking &&
            !assistant.isProcessing &&
            !isCommandRunningRef.current
        ) {
            const text = voice.finalTranscript.trim()
            if (text && text !== lastProcessedRef.current) {
                lastProcessedRef.current = text
                isCommandRunningRef.current = true
                setDisplayText(text)

                const lower = text.toLowerCase()

                // ──── Deactivation commands ────
                if (lower.includes('stop listening') || lower.includes('go to sleep') || lower.includes('goodbye') || lower.includes('bye')) {
                    setResponseText("Going to sleep 💤")
                    voice.speak("Going to sleep. Say Hey Designika to wake me up!")
                        .then(() => {
                            voice.startPassiveListening()
                            isCommandRunningRef.current = false
                            autoHide(3000)
                        })
                    return
                }

                // ──── Camera commands ────
                if (lower.includes('open camera') || lower.includes('show camera') || lower.includes('scan room')) {
                    camera.startCamera()
                    setResponseText("📸 Camera ready! Say 'analyze' when ready.")
                    voice.speak("Camera opened! Say analyze when ready.")
                        .then(() => { isCommandRunningRef.current = false })
                    return
                }
                if (lower.includes('analyze') && camera.isActive) {
                    const frame = camera.captureFrame()
                    camera.stopCamera()
                    processCommand("Analyze this room and suggest design improvements.", frame || undefined)
                    return
                }

                // ──── Send to AI backend ────
                processCommand(text)
            }
        }
    }, [voice.finalTranscript])

    // ═══════════════════════════════════════════════════════
    // PROCESS COMMAND: Send to API → Speak reply → Resume
    // ═══════════════════════════════════════════════════════
    const processCommand = async (text: string, imageBase64?: string) => {
        setDisplayText(text)
        setResponseText('')

        const result = await assistant.send(text, imageBase64)

        if (result?.reply) setResponseText(result.reply)

        // Speak the response — useVoice will kill recognition during this
        // and restart it after TTS finishes + 500ms buffer
        if (result?.speech && ttsEnabled) {
            await voice.speak(result.speech)
        }

        // Command is done — allow next command
        isCommandRunningRef.current = false

        // Clear displayed text after 6s so bubble is ready for next command
        autoHide(6000)
    }

    // ═══════════════════════════════════════════════════════
    // AUTO-HIDE: Clear text after inactivity
    // ═══════════════════════════════════════════════════════
    const autoHide = (delay: number) => {
        clearAutoHide()
        fadeTimerRef.current = setTimeout(() => {
            if (voice.mode !== 'active') {
                // Went back to passive — hide the bubble
                setShowBubble(false)
            } else {
                // Still active — just clear text, keep bubble open
                setDisplayText('')
                setResponseText('')
            }
        }, delay)
    }

    const clearAutoHide = () => {
        if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null }
    }

    const handleOrbClick = () => {
        if (voice.mode === 'active') {
            voice.startPassiveListening()
            isCommandRunningRef.current = false
            autoHide(1500)
        } else {
            voice.startActiveListening()
            setShowBubble(true)
        }
    }

    const orbGradient: Record<VisualState, string> = {
        sleeping: 'from-amber-500 to-orange-600',
        listening: 'from-green-400 to-emerald-600',
        thinking: 'from-blue-500 to-purple-600',
        speaking: 'from-violet-500 to-fuchsia-600',
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100000] flex flex-col items-end font-sans">

            {/* ═══ Compact Side Bubble (above the orb) ═══ */}
            {showBubble && (
                <div className="mb-4 w-[300px] flex flex-col items-end gap-2.5 animate-in slide-in-from-bottom-3 fade-in duration-300">

                    {/* Camera preview */}
                    {camera.isActive && (
                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <video ref={camera.videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[9px] uppercase tracking-wider font-bold rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Live
                            </div>
                            <button
                                onClick={() => {
                                    const frame = camera.captureFrame(); camera.stopCamera()
                                    processCommand("Analyze this room and suggest design improvements.", frame || undefined)
                                }}
                                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white transition flex items-center gap-1.5"
                            >
                                <Eye size={12} /> Analyze
                            </button>
                        </div>
                    )}

                    {/* Response from Designika */}
                    {responseText && (
                        <div className="w-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/10 rounded-2xl px-4 py-3 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Sparkles size={10} className="text-white" />
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-200 text-xs leading-relaxed">
                                    {responseText.length > 180 ? responseText.slice(0, 180) + '...' : responseText}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* User transcript */}
                    {displayText && !responseText && (
                        <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl px-4 py-2.5 shadow-lg animate-in fade-in duration-200">
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs italic">"{displayText}"</p>
                        </div>
                    )}

                    {/* Waveform when listening (no text yet) */}
                    {visualState === 'listening' && !displayText && !responseText && (
                        <div className="flex items-center gap-2.5 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl px-4 py-2.5 shadow-lg">
                            <div className="flex items-end gap-[2px]">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-[3px] bg-green-500 rounded-full" style={{
                                        animationName: 'bounce', animationDuration: `${350 + i * 80}ms`,
                                        animationIterationCount: 'infinite', animationDirection: 'alternate',
                                        height: `${6 + Math.random() * 12}px`, animationDelay: `${i * 60}ms`
                                    }} />
                                ))}
                            </div>
                            <span className="text-green-600 dark:text-green-400 text-[11px] font-medium">Listening...</span>
                        </div>
                    )}

                    {/* Thinking indicator */}
                    {visualState === 'thinking' && (
                        <div className="flex items-center gap-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 rounded-2xl px-4 py-2.5 shadow-lg">
                            <Loader2 size={14} className="text-blue-500 animate-spin" />
                            <span className="text-blue-500 text-[11px] font-medium">Thinking...</span>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Floating Orb (always visible) ═══ */}
            <div className="relative group">
                {/* Tooltip */}
                <span className="absolute right-0 bottom-full mb-2 px-2.5 py-1 bg-zinc-900 text-white text-[10px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
                    {visualState === 'listening' ? '🎙️ Listening...' :
                        visualState === 'thinking' ? '🧠 Thinking...' :
                            visualState === 'speaking' ? '🔊 Speaking...' :
                                voice.mode === 'passive' ? '💤 Say "Hey Designika"' :
                                    'Designika AI'}
                    <span className="absolute right-4 top-full border-4 border-transparent border-t-zinc-900"></span>
                </span>

                <button
                    onClick={handleOrbClick}
                    className="relative w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95"
                >
                    {/* Background */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${orbGradient[visualState]} transition-all duration-700`}></div>

                    {/* Pulse when passive (amber) */}
                    {voice.mode === 'passive' && visualState === 'sleeping' && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse opacity-30"></div>
                    )}

                    {/* Pulse when listening (green) */}
                    {visualState === 'listening' && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
                            <div className="absolute -inset-1 rounded-full bg-green-500 animate-pulse opacity-10"></div>
                        </>
                    )}

                    {/* Icon */}
                    <div className="relative z-10 text-white">
                        {visualState === 'listening' ? (
                            <Mic size={22} className="animate-pulse" />
                        ) : visualState === 'thinking' ? (
                            <Loader2 size={22} className="animate-spin" />
                        ) : visualState === 'speaking' ? (
                            <Volume2 size={20} className="animate-bounce" />
                        ) : (
                            <Sparkles size={22} />
                        )}
                    </div>

                    {/* Status dot */}
                    <span className={`absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-white ${voice.mode === 'passive' || voice.mode === 'active' ? 'bg-green-400 animate-pulse' : 'bg-zinc-400'
                        }`}></span>
                </button>
            </div>
        </div>
    )
}
