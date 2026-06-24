/**
 * useVoice - Siri/Jarvis-style Voice Engine
 * 
 * Proper state machine to prevent self-listening loops:
 * 
 *   SLEEPING  →  (wake word detected)  →  LISTENING
 *   LISTENING →  (1.5s silence after speech)  →  fires finalTranscript
 *   [Parent calls speak()]  →  SPEAKING  (recognition completely killed)
 *   SPEAKING  →  (TTS ends)  →  LISTENING  (for follow-up commands)
 *   LISTENING →  ("stop/goodbye")  →  SLEEPING
 *
 * Uses Web Speech API (free, built into browser)
 */
import { useState, useRef, useCallback, useEffect } from 'react'

type VoiceMode = 'off' | 'passive' | 'active'

interface UseVoiceReturn {
    mode: VoiceMode
    isListening: boolean
    isSpeaking: boolean
    transcript: string
    finalTranscript: string
    startPassiveListening: () => void
    startActiveListening: () => void
    stopListening: () => void
    speak: (text: string) => Promise<void>
    stopSpeaking: () => void
    isSupported: boolean
    enableWakeWord: () => void
    disableWakeWord: () => void
    wakeWordEnabled: boolean
}

// Wake word variations
const WAKE_WORDS = [
    'hey designika',
    'hey designer',
    'hey design',
    'a designika',
    'hey desinika',
    'hey jessica',
    'hey siri',
    'hey jarvis',
    'okay designika',
    'ok designika',
]

export function useVoice(): UseVoiceReturn {
    const [mode, setMode] = useState<VoiceMode>('off')
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [finalTranscript, setFinalTranscript] = useState('')
    const [wakeWordEnabled, setWakeWordEnabled] = useState(true)

    const recognitionRef = useRef<any>(null)
    const synthRef = useRef(window.speechSynthesis)
    const modeRef = useRef<VoiceMode>('off')
    const isSpeakingRef = useRef(false)        // TRUE = TTS is active, kill all recognition
    const silenceTimerRef = useRef<any>(null)   // Silence detection timer
    const restartTimerRef = useRef<any>(null)
    const commandBufferRef = useRef('')         // Accumulates speech fragments
    const isProcessingRef = useRef(false)       // Prevents double-send

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const isSupported = !!SpeechRecognition

    // Sync refs
    useEffect(() => { modeRef.current = mode }, [mode])
    useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])

    // Pre-load voices for proper English voice selection
    useEffect(() => {
        const loadVoices = () => {
            const voices = synthRef.current.getVoices()
            if (voices.length > 0) {
                console.log(`🔊 ${voices.length} voices pre-loaded`)
            }
        }
        loadVoices()
        synthRef.current.addEventListener('voiceschanged', loadVoices)
        return () => { synthRef.current.removeEventListener('voiceschanged', loadVoices) }
    }, [])

    // ═══════════════════════════════════════════════════
    // SILENCE DETECTION: Wait 1.5s after user stops talking
    // ═══════════════════════════════════════════════════
    const resetSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
            // User has been silent for 1.5s — fire the buffered command
            const command = commandBufferRef.current.trim()
            if (command && modeRef.current === 'active' && !isSpeakingRef.current && !isProcessingRef.current) {
                isProcessingRef.current = true
                console.log('🎙️ Silence detected, sending command:', command)
                setFinalTranscript(command)
                commandBufferRef.current = ''
            }
        }, 1500)
    }, [])

    // ═══════════════════════════════════════════════════
    // RECOGNITION: Create SpeechRecognition instance
    // ═══════════════════════════════════════════════════
    const createRecognition = useCallback(() => {
        if (!isSupported) return null

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognition.maxAlternatives = 3

        recognition.onresult = (event: any) => {
            // CRITICAL: If TTS is speaking, ignore ALL recognition results
            if (isSpeakingRef.current) return

            let interim = ''
            let final = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    final += t
                } else {
                    interim += t
                }
            }

            const currentText = (final || interim).toLowerCase().trim()

            // ──── PASSIVE MODE: Only check for wake word ────
            if (modeRef.current === 'passive') {
                const detected = WAKE_WORDS.some(ww => currentText.includes(ww))
                if (detected) {
                    console.log('🎙️ Wake word detected!')
                    setTranscript('')
                    setFinalTranscript('')
                    commandBufferRef.current = ''
                    isProcessingRef.current = false
                    setMode('active')
                    modeRef.current = 'active'
                    // Restart fresh for active mode
                    try { recognition.stop() } catch (e) { /* ignore */ }
                }
                return  // Don't show transcript in passive mode
            }

            // ──── ACTIVE MODE: Buffer speech with silence detection ────
            if (modeRef.current === 'active') {
                // Show live transcript
                setTranscript(final || interim)

                if (final) {
                    // Accumulate final fragments into the command buffer
                    commandBufferRef.current += ' ' + final
                    // Reset the silence timer — user is still speaking
                    resetSilenceTimer()
                } else if (interim) {
                    // User is mid-word, reset silence timer
                    resetSilenceTimer()
                }
            }
        }

        recognition.onend = () => {
            // NEVER restart if TTS is speaking
            if (isSpeakingRef.current) return

            // Auto-restart if we're in a listening mode
            if (modeRef.current === 'passive' || modeRef.current === 'active') {
                restartTimerRef.current = setTimeout(() => {
                    if (isSpeakingRef.current) return  // Double-check
                    try {
                        recognition.start()
                    } catch (e) {
                        console.warn('Recognition restart failed:', e)
                    }
                }, 150)
            }
        }

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'aborted') return
            console.error('Speech recognition error:', event.error)
        }

        return recognition
    }, [isSupported, resetSilenceTimer])

    // ═══════════════════════════════════════════════════
    // INITIALIZE: Create recognition + auto-start passive
    // ═══════════════════════════════════════════════════
    useEffect(() => {
        recognitionRef.current = createRecognition()

        if (recognitionRef.current) {
            const timer = setTimeout(() => {
                setMode('passive')
                modeRef.current = 'passive'
                try {
                    recognitionRef.current?.start()
                    console.log('🎙️ Designika: Passive wake-word listening started')
                } catch (e) {
                    console.warn('Auto-start failed:', e)
                }
            }, 500)
            return () => {
                clearTimeout(timer)
                if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                try { recognitionRef.current?.stop() } catch (e) { /* ignore */ }
            }
        }

        return () => {
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
            try { recognitionRef.current?.stop() } catch (e) { /* ignore */ }
        }
    }, [createRecognition])

    // ═══════════════════════════════════════════════════
    // CONTROL FUNCTIONS
    // ═══════════════════════════════════════════════════
    const enableWakeWord = useCallback(() => {
        setWakeWordEnabled(true)
        startPassiveFn()
    }, [])

    const disableWakeWord = useCallback(() => {
        setWakeWordEnabled(false)
        stopFn()
    }, [])

    const startPassiveFn = useCallback(() => {
        if (!recognitionRef.current) return
        setMode('passive')
        modeRef.current = 'passive'
        setTranscript('')
        setFinalTranscript('')
        commandBufferRef.current = ''
        isProcessingRef.current = false
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
        setTimeout(() => {
            if (isSpeakingRef.current) return
            try { recognitionRef.current?.start() } catch (e) { console.warn('Start passive failed:', e) }
        }, 200)
    }, [])

    const startActiveFn = useCallback(() => {
        if (!recognitionRef.current) return
        setMode('active')
        modeRef.current = 'active'
        setTranscript('')
        setFinalTranscript('')
        commandBufferRef.current = ''
        isProcessingRef.current = false
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
        setTimeout(() => {
            if (isSpeakingRef.current) return
            try { recognitionRef.current?.start() } catch (e) { console.warn('Start active failed:', e) }
        }, 200)
    }, [])

    const stopFn = useCallback(() => {
        setMode('off')
        modeRef.current = 'off'
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        commandBufferRef.current = ''
        isProcessingRef.current = false
        try { recognitionRef.current?.stop() } catch (e) { /* ignore */ }
    }, [])

    // ═══════════════════════════════════════════════════
    // SPEAK: TTS with FULL recognition shutdown
    // This is the critical fix — completely kill recognition
    // during TTS to prevent self-listening loops.
    // ═══════════════════════════════════════════════════
    const speak = useCallback((text: string): Promise<void> => {
        return new Promise((resolve) => {
            if (!synthRef.current) { resolve(); return }
            synthRef.current.cancel()

            // ╔══════════════════════════════════════╗
            // ║  STEP 1: KILL recognition completely ║
            // ╚══════════════════════════════════════╝
            isSpeakingRef.current = true
            setIsSpeaking(true)
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
            try { recognitionRef.current?.stop() } catch (e) { /* ignore */ }

            // ╔══════════════════════════════════════╗
            // ║  STEP 2: Build utterance             ║
            // ╚══════════════════════════════════════╝
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'en-US'
            utterance.rate = 1.05
            utterance.pitch = 1.0
            utterance.volume = 1.0

            // Pick the best English voice
            const voices = synthRef.current.getVoices()
            const englishVoices = voices.filter((v: SpeechSynthesisVoice) => v.lang.startsWith('en'))

            const bestVoice =
                englishVoices.find((v: SpeechSynthesisVoice) => v.name.includes('Google US English')) ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.name.includes('Google UK English')) ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.name === 'Microsoft Jenny Online (Natural) - English (United States)') ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.name.includes('Jenny')) ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.name.includes('Aria')) ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.name.includes('Zira')) ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.name.includes('Samantha')) ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.name.includes('Natural') && v.lang === 'en-US') ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.lang === 'en-US') ||
                englishVoices.find((v: SpeechSynthesisVoice) => v.lang === 'en-GB') ||
                englishVoices[0] || null

            if (bestVoice) {
                utterance.voice = bestVoice
                console.log('🔊 Using voice:', bestVoice.name, bestVoice.lang)
            }

            // ╔══════════════════════════════════════╗
            // ║  STEP 3: Resume listening AFTER TTS  ║
            // ╚══════════════════════════════════════╝
            const resumeListening = () => {
                setIsSpeaking(false)
                isSpeakingRef.current = false
                commandBufferRef.current = ''
                isProcessingRef.current = false

                // Wait 500ms after TTS ends before restarting recognition
                // This ensures the speaker is fully silent and mic doesn't pick up residual audio
                setTimeout(() => {
                    if (modeRef.current === 'active' || modeRef.current === 'passive') {
                        try {
                            recognitionRef.current?.start()
                            console.log('🎙️ Recognition resumed after TTS')
                        } catch (e) {
                            console.warn('Resume recognition failed:', e)
                        }
                    }
                }, 500)

                resolve()
            }

            utterance.onend = resumeListening
            utterance.onerror = resumeListening

            // ╔══════════════════════════════════════╗
            // ║  STEP 4: Speak!                      ║
            // ╚══════════════════════════════════════╝
            synthRef.current.speak(utterance)
        })
    }, [])

    const stopSpeaking = useCallback(() => {
        synthRef.current?.cancel()
        setIsSpeaking(false)
        isSpeakingRef.current = false
    }, [])

    // ═══════════════════════════════════════════════════
    // CLEAR processing flag when finalTranscript is consumed
    // The parent component should call this after processing
    // ═══════════════════════════════════════════════════
    // (isProcessingRef is reset in speak() → resumeListening)

    return {
        mode,
        isListening: mode === 'passive' || mode === 'active',
        isSpeaking,
        transcript,
        finalTranscript,
        startPassiveListening: startPassiveFn,
        startActiveListening: startActiveFn,
        stopListening: stopFn,
        speak,
        stopSpeaking,
        isSupported,
        enableWakeWord,
        disableWakeWord,
        wakeWordEnabled
    }
}
