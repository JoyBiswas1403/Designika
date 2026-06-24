/**
 * useCamera - Camera Capture Hook for Vision
 * Uses MediaStream API to access device camera and capture frames.
 */
import { useState, useRef, useCallback } from 'react'

interface UseCameraReturn {
    isActive: boolean
    videoRef: React.RefObject<HTMLVideoElement>
    startCamera: () => Promise<void>
    stopCamera: () => void
    captureFrame: () => string | null
    error: string | null
}

export function useCamera(): UseCameraReturn {
    const [isActive, setIsActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null!)
    const streamRef = useRef<MediaStream | null>(null)

    const startCamera = useCallback(async () => {
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }
            setIsActive(true)
        } catch (err: any) {
            console.error('Camera error:', err)
            setError(err.message || 'Camera access denied')
            setIsActive(false)
        }
    }, [])

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setIsActive(false)
    }, [])

    const captureFrame = useCallback((): string | null => {
        if (!videoRef.current || !isActive) return null

        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth || 640
        canvas.height = videoRef.current.videoHeight || 480

        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7) // Compress for speed

        return dataUrl
    }, [isActive])

    return {
        isActive,
        videoRef,
        startCamera,
        stopCamera,
        captureFrame,
        error
    }
}
