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
 * Contact: joy@allcognix.com
 * Date: 30-01-2026
 **********************************************************************************/

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Upload,
    Wand2,
    X,
    Palette,
    Undo2,
    Download,
    Maximize2,
    Box,
    Sun,
    Moon,
    Cloud,
    Zap,
    ImageIcon,
    Sparkles,
    Eye,
    PanelRight,
    PanelLeft
} from 'lucide-react'
import { useDesignStore } from '../store/design'
import { EraserCanvas } from '../components/ui/EraserCanvas'
import { designsApi, transformApi, inpaintingApi } from '../lib/api'
import ComparisonSlider from '../components/ui/ComparisonSlider'
import { ThemeToggle } from '../components/ui'
import { ShutterLogo } from '../components/ui/ShutterLogo'

// --- ASSETS & CONFIGURATION ---
const STYLES = [
    { id: 'modern_minimalist', name: 'Minimalist', description: 'Clean lines, neutral palette', img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400' },
    { id: 'scandinavian', name: 'Scandi', description: 'Hygge, light wood, cozy', img: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=400' },
    { id: 'industrial', name: 'Industrial', description: 'Raw materials, urban look', img: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=400' },
    { id: 'mid_century_modern', name: 'Mid-Century', description: 'Retro 50s-60s aesthetic', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=400' },
    { id: 'bohemian', name: 'Boho', description: 'Eclectic, layered textures', img: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=400' },
    { id: 'contemporary', name: 'Contemporary', description: 'Current trends', img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400' },
    { id: 'traditional', name: 'Classic', description: 'Timeless elegance', img: 'https://images.unsplash.com/photo-1616486029423-aaa478965c96?auto=format&fit=crop&q=80&w=400' },
    { id: 'coastal', name: 'Coastal', description: 'Breezy, sea-inspired', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400' },
    { id: 'farmhouse', name: 'Farmhouse', description: 'Rustic charm', img: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=400' },
    { id: 'art_deco', name: 'Art Deco', description: 'Glamorous, geometric', img: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=400' },
    { id: 'japanese_zen', name: 'Zen', description: 'Peaceful, natural balance', img: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=400' },
    { id: 'biophilic', name: 'Biophilic', description: 'Nature-infused', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400' },
    { id: 'maximalist', name: 'Maximalist', description: 'Bold, curated chaos', img: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=400' },
]

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room', 'Balcony', 'Closet']

// Enhanced Lighting Modes for "Best Generations"
const LIGHTING_MODES = [
    {
        id: 'golden',
        name: 'Golden Hour',
        description: 'Warm, magical sunset light',
        color: 'from-amber-500/20 to-orange-500/20',
        icon: <Sun className="text-amber-400" size={18} />,
        prompt: "golden hour lighting, warm sun rays, soft shadows, cozy atmosphere, cinematic lighting, 8k"
    },
    {
        id: 'nordic',
        name: 'Nordic Day',
        description: 'Bright, diffused soft white',
        color: 'from-slate-200/20 to-white/20',
        icon: <Cloud className="text-blue-100" size={18} />,
        prompt: "soft diffused daylight, bright airy atmosphere, scandinavian lighting, white balance, clean look, high key"
    },
    {
        id: 'blue_hour',
        name: 'Blue Hour',
        description: 'Deep, moody twilight',
        color: 'from-blue-600/20 to-indigo-900/20',
        icon: <Moon className="text-indigo-400" size={18} />,
        prompt: "blue hour lighting, twilight, moody atmosphere, cold tones, cinematic depth, interior lights glowing"
    },
    {
        id: 'studio',
        name: 'Pro Studio',
        description: 'Perfectly balanced clarity',
        color: 'from-gray-100/10 to-gray-300/10',
        icon: <Zap className="text-white" size={18} />,
        prompt: "professional studio lighting, balanced exposure, neutral color temperature, sharp details, architectural photography"
    },
    {
        id: 'warm_bulb',
        name: 'Cozy Tungsten',
        description: 'Intimate evening warmth',
        color: 'from-orange-400/10 to-yellow-600/10',
        icon: <Sun className="text-orange-300" size={18} />,
        prompt: "warm tungsten lighting, cozy evening atmosphere, interior lamp lighting, intimate setting, inviting, 3000k"
    }
]

// Generation Steps Simulation messages - OPTIONAL Use if needed for refined loading text
const GENERATION_STEPS = [
    "Analyzing spatial geometry...",
    "Calculating lighting paths...",
    "Applying texture maps...",
    "Rendering reflections...",
    "Color grading final output..."
]

export default function TransformPage() {
    const navigate = useNavigate()

    // Studio State
    // Use Global Store for Image Shared State (Chat Vision)
    const {
        selectedImage, setSelectedImage,
        selectedFile, setSelectedFile,
        generatedImage, setGeneratedImage,
        setStyle, setRoomType
    } = useDesignStore()

    // Local UI state
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStep, setGenerationStep] = useState(0)
    void generationStep // Silence unused warning
    const [error, setError] = useState<string | null>(null)

    // Configuration State
    const [activeStyle, setActiveStyle] = useState(STYLES[0])
    const [activeRoom, setActiveRoom] = useState(ROOM_TYPES[0])
    const [activeLighting, setActiveLighting] = useState(LIGHTING_MODES[0])
    const [creativityLevel, setCreativityLevel] = useState(65)
    const [isDragging, setIsDragging] = useState(false)
    const [showUploadPrompt, setShowUploadPrompt] = useState(false)

    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

    // Sync active style/room to global store for AI Context
    useEffect(() => {
        setStyle(activeStyle.name)
        setRoomType(activeRoom)
    }, [activeStyle, activeRoom, setStyle, setRoomType])

    const [isEraserMode, setIsEraserMode] = useState(false)
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

    // Polling ref
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Canvas ref for fullscreen
    const canvasRef = useRef<HTMLDivElement>(null)

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [])

    // Ref for the hidden file input (voice-triggered upload)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Listen for Designika voice assistant custom events
    useEffect(() => {
        const onGenerate = () => { handleGenerate() }
        const onDownload = () => { handleDownload() }
        const onUpload = () => {
            // Try programmatic click (works in Chrome)
            fileInputRef.current?.click()
            // Also show a visible prompt as fallback (for browsers that block async file clicks)
            setShowUploadPrompt(true)
            setTimeout(() => setShowUploadPrompt(false), 8000)
        }
        const onSetLighting = (e: Event) => {
            const lightingId = (e as CustomEvent).detail
            const match = LIGHTING_MODES.find(l => l.id === lightingId)
            if (match) setActiveLighting(match)
        }
        const onSetCreativity = (e: Event) => {
            const level = (e as CustomEvent).detail
            if (typeof level === 'number' && level >= 0 && level <= 100) {
                setCreativityLevel(level)
            }
        }
        const onToggleSidebar = (e: Event) => {
            const side = (e as CustomEvent).detail
            if (side === 'left') setLeftSidebarOpen(prev => !prev)
            if (side === 'right') setRightSidebarOpen(prev => !prev)
        }
        const onReset = () => {
            setSelectedImage(null)
            setSelectedFile(null)
            setGeneratedImage(null)
            setError(null)
            setIsEraserMode(false)
        }
        const onZoom = (e: Event) => {
            const dir = (e as CustomEvent).detail
            const canvas = canvasRef.current
            if (!canvas) return
            const current = parseFloat(canvas.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || '1')
            if (dir === 'in') canvas.style.transform = `scale(${Math.min(current + 0.25, 3)})`
            else if (dir === 'out') canvas.style.transform = `scale(${Math.max(current - 0.25, 0.5)})`
            else canvas.style.transform = 'scale(1)'
        }
        const onToggleEraser = () => {
            setIsEraserMode(prev => !prev)
        }

        window.addEventListener('designika:generate', onGenerate)
        window.addEventListener('designika:download', onDownload)
        window.addEventListener('designika:upload', onUpload)
        window.addEventListener('designika:set-lighting', onSetLighting)
        window.addEventListener('designika:set-creativity', onSetCreativity)
        window.addEventListener('designika:toggle-sidebar', onToggleSidebar)
        window.addEventListener('designika:reset', onReset)
        window.addEventListener('designika:zoom', onZoom)
        window.addEventListener('designika:toggle-eraser', onToggleEraser)

        return () => {
            window.removeEventListener('designika:generate', onGenerate)
            window.removeEventListener('designika:download', onDownload)
            window.removeEventListener('designika:upload', onUpload)
            window.removeEventListener('designika:set-lighting', onSetLighting)
            window.removeEventListener('designika:set-creativity', onSetCreativity)
            window.removeEventListener('designika:toggle-sidebar', onToggleSidebar)
            window.removeEventListener('designika:reset', onReset)
            window.removeEventListener('designika:zoom', onZoom)
            window.removeEventListener('designika:toggle-eraser', onToggleEraser)
        }
    })

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)

                // Get dimensions
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    setImageDimensions({ width: img.width, height: img.height });
                };

                setGeneratedImage(null)
                setError(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = () => {
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)

                // Get dimensions
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    setImageDimensions({ width: img.width, height: img.height });
                };

                setGeneratedImage(null)
                setError(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const pollJobStatus = async (jobId: string) => {
        try {
            const { data } = await transformApi.getJobStatus(jobId)

            if (data.status === 'completed') {
                if (pollingRef.current) clearInterval(pollingRef.current)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = data.result as any
                setGeneratedImage(`data:image/jpeg;base64,${result.images[0].image_b64}`)
                setIsGenerating(false)
            } else if (data.status === 'failed') {
                if (pollingRef.current) clearInterval(pollingRef.current)
                setIsGenerating(false)
                setError(data.error || 'Transformation failed')
            }
        } catch (err) {
            console.error('Polling error', err)
        }
    }

    const handleInpainting = async (maskBlob: Blob) => {
        if (!selectedFile) return;
        setIsEraserMode(false);
        setIsGenerating(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('mask', maskBlob, 'mask.png');
            formData.append('prompt', "remove object, clean background");

            const { data: job } = await inpaintingApi.submit(formData);

            // Poll for result
            const pollInterval = setInterval(async () => {
                const { data } = await inpaintingApi.getStatus(job.id);
                if (data.status === 'succeeded' && data.output) {
                    clearInterval(pollInterval);

                    // The output is likely a URL. We need to fetch it to set it as selectedImage for next step.
                    // But for now, let's just show it.
                    // Actually, if we want to continue designing, we should probably set it as selectedImage.
                    // But typically output is a remote URL. 
                    // Let's set it as generatedImage first to show "Removed".
                    // Or better: Replace the Original with this new clean version?
                    // User probably wants to use the "clean" version as the input for "style transfer".
                    // So:
                    setSelectedImage(data.output as string);

                    // We also need to update 'selectedFile' if we want to re-upload this new image.
                    // Fetches the blob from the URL to update selectedFile
                    const res = await fetch(data.output as string);
                    const blob = await res.blob();
                    const file = new File([blob], "cleaned_image.png", { type: "image/png" });
                    setSelectedFile(file);

                    setIsGenerating(false);
                } else if (data.status === 'failed') {
                    clearInterval(pollInterval);
                    setError('Inpainting failed');
                    setIsGenerating(false);
                }
            }, 2000);

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.detail || 'Failed to start magic eraser';
            setError(errorMessage);
            setIsGenerating(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) return

        setIsGenerating(true)
        setGenerationStep(0)
        setError(null)

        // Simulate progress messages
        let step = 0
        const stepInterval = setInterval(() => {
            step++
            setGenerationStep(step)
            if (step >= GENERATION_STEPS.length - 1) clearInterval(stepInterval)
        }, 800)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('title', `Studio - ${new Date().toLocaleDateString()}`)
            formData.append('room_type', activeRoom.toLowerCase().replace(' ', '_'))
            formData.append('style', activeStyle.id)

            const { data: design } = await designsApi.create(formData)

            const { data: job } = await transformApi.queueTransform({
                design_id: design.id,
                style: activeStyle.id,
                intensity: creativityLevel / 100,
                lighting: activeLighting.id,
                time_of_day: 'enrich',
            })

            pollingRef.current = setInterval(() => {
                pollJobStatus(job.job_id)
            }, 2000)

        } catch (err: any) {
            console.error('Generate error', err)
            setError(err.response?.data?.detail || 'Failed to start generation')
            setIsGenerating(false)
            clearInterval(stepInterval)
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }

    const handleDownload = () => {
        if (!generatedImage) return
        const link = document.createElement('a')
        link.href = generatedImage
        link.download = `designika-${Date.now()}.jpg`
        link.click()
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            canvasRef.current?.requestFullscreen()
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }

    return (
        <div className="h-screen overflow-hidden relative selection:bg-amber-500/30 flex flex-col transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
            {/* Hidden file input (always mounted for voice-triggered upload) */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => { setShowUploadPrompt(false); handleFileUpload(e) }}
            />

            {/* Voice-triggered upload prompt — full-screen takeover */}
            {showUploadPrompt && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200000]" />
                    <div className="fixed inset-0 z-[200001] flex flex-col items-center justify-center gap-6">
                        <p className="text-white/70 text-sm font-medium tracking-wide uppercase">Designika Voice Upload</p>
                        <button
                            onClick={() => { fileInputRef.current?.click(); setShowUploadPrompt(false) }}
                            className="px-14 py-8 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xl font-bold rounded-3xl shadow-2xl shadow-amber-500/50 flex items-center gap-4 hover:scale-105 active:scale-95 transition-all animate-pulse"
                        >
                            📸 Tap Here to Select Photo
                        </button>
                        <button
                            onClick={() => setShowUploadPrompt(false)}
                            className="text-white/50 hover:text-white text-sm mt-4 transition-colors"
                        >
                            ✕ Cancel
                        </button>
                    </div>
                </>
            )}

            {/* Background Visuals */}
            <div className="fixed inset-0 aurora-bg pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            {/* Top Bar */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-md z-50 transition-colors shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/" className="hover:scale-105 transition-transform flex items-center gap-2 group">
                        <ShutterLogo />
                        <span className="font-serif font-bold text-lg tracking-tight group-hover:text-amber-200 transition-colors">Designika</span>
                    </Link>
                    <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-2"></div>
                    <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        Studio
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="lg:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" title="Toggle Structure">
                        <PanelLeft size={20} />
                    </button>
                    <button onClick={() => setRightSidebarOpen(!rightSidebarOpen)} className="lg:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" title="Toggle Lighting">
                        <PanelRight size={20} />
                    </button>
                    <ThemeToggle />
                    <button
                        onClick={() => navigate('/')}
                        className="px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/10 text-slate-500 hover:text-white dark:text-white/60 transition-colors flex items-center gap-2"
                        title="Exit Studio"
                    >
                        <X size={18} />
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT SIDEBAR: STRUCTURE & AESTHETICS */}
                <aside className={`
                    absolute lg:relative z-40 h-full w-80 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col
                    ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'}
                `}>
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* Room Type */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Box size={14} /> Structure
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ROOM_TYPES.map(room => (
                                    <button
                                        key={room}
                                        onClick={() => setActiveRoom(room)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeRoom === room
                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                                            : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent dark:text-gray-300'
                                            }`}
                                    >
                                        {room}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Design Style */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Palette size={14} /> Aesthetics
                            </label>
                            <div className="space-y-2">
                                {STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setActiveStyle(style)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-all group ${activeStyle.id === style.id
                                            ? 'border-amber-500 bg-amber-500/5'
                                            : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm">
                                            <img
                                                src={style.img}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                alt={style.name}
                                            />
                                            {activeStyle.id === style.id && <div className="absolute inset-0 bg-amber-500/20 mix-blend-overlay"></div>}
                                        </div>

                                        <div className="text-left min-w-0">
                                            <div className="text-sm font-bold truncate dark:text-gray-200">{style.name}</div>
                                            <div className="text-[10px] opacity-60 truncate dark:text-gray-400">{style.description}</div>
                                        </div>
                                        {activeStyle.id === style.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CENTER CANVAS */}
                <main className="flex-1 relative flex flex-col min-w-0 bg-dots-pattern">

                    {/* Canvas Toolbar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-4 border border-white/10 shadow-2xl animate-[fadeIn_1s_ease-out_forwards]">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Studio Canvas</span>
                        <div className="h-4 w-[1px] bg-white/20"></div>
                        <button
                            onClick={() => setIsEraserMode(!isEraserMode)}
                            className={`hover:text-amber-400 transition-colors ${isEraserMode ? 'text-amber-500' : ''}`}
                            title="Magic Eraser"
                        >
                            <Sparkles size={14} />
                        </button>
                        <div className="h-4 w-[1px] bg-white/20"></div>
                        <button onClick={toggleFullscreen} className="hover:text-amber-400 transition-colors" title="Fit"><Maximize2 size={14} /></button>
                        <button className="hover:text-amber-400 transition-colors" title="Compare"><Eye size={14} /></button>
                    </div>

                    <div className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-hidden">
                        <div
                            ref={canvasRef}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`
                                relative w-full h-full max-w-6xl glass-panel rounded-[2rem] overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-500
                                ${isDragging ? 'border-amber-500 bg-amber-500/10 scale-[0.98]' : 'border-white/10'}
                                ${!selectedImage ? 'bg-white/5 backdrop-blur-sm' : 'bg-black'}
                            `}
                        >

                            {!selectedImage ? (
                                <div className="text-center pointer-events-none p-8 animate-in fade-in zoom-in duration-500">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-8 relative group">
                                        <div className="absolute inset-0 rounded-full border border-dashed border-white/30 animate-[spin_20s_linear_infinite] group-hover:border-amber-500/50 transition-colors"></div>
                                        <Upload size={40} className="text-white/80 group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <h3 className="text-3xl font-serif mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-white font-medium">
                                        Upload your space
                                    </h3>
                                    <p className="text-slate-400 dark:text-white/40 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                                        Drop your photo here or browse to begin the transformation.
                                    </p>
                                    <label className="pointer-events-auto inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full text-sm font-bold cursor-pointer hover:bg-amber-50 hover:scale-105 transition-all shadow-lg shadow-amber-500/20">
                                        <ImageIcon size={16} />
                                        Select Photo
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center bg-zinc-900/50">
                                    {generatedImage ? (
                                        <div className="w-full h-full max-h-full flex items-center justify-center p-0">
                                            <ComparisonSlider before={selectedImage} after={generatedImage} label="REVEAL" />
                                        </div>
                                    ) : (
                                        <>
                                            <img
                                                src={selectedImage}
                                                className={`max-w-full max-h-full object-contain shadow-2xl transition-all duration-1000 ${isGenerating ? 'blur-md scale-105 opacity-50' : ''}`}
                                                alt="Original"
                                            />

                                            {/* Error Display */}
                                            {error && (
                                                <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/90 backdrop-blur-md border border-red-400 rounded-full text-white text-sm font-medium shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 z-[60]">
                                                    <X size={16} /> {error}
                                                </div>
                                            )}

                                            {/* Premium Pricing/Loading State */}
                                            {isGenerating && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/60 backdrop-blur-2xl transition-all duration-700">
                                                    <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">

                                                        {/* Elegant Pulse Loader */}
                                                        <div className="relative">
                                                            <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
                                                                <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse flex items-center justify-center">
                                                                    <Sparkles size={24} className="text-amber-200/80 animate-[spin_3s_linear_infinite]" />
                                                                </div>
                                                            </div>
                                                            <div className="absolute inset-0 border-t border-amber-500/50 rounded-full animate-spin"></div>
                                                        </div>

                                                        {/* Minimal Typography */}
                                                        <div className="text-center space-y-3">
                                                            <h4 className="text-2xl font-light text-white tracking-widest uppercase font-serif">
                                                                Refining
                                                            </h4>
                                                            <p className="text-white/40 text-xs tracking-[0.2em] font-medium uppercase">
                                                                Creating your tailored design
                                                            </p>
                                                        </div>

                                                        {/* Minimal Progress Line */}
                                                        <div className="w-48 h-[1px] bg-white/10 mt-2 overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-200/50 animate-[shimmer_2s_infinite]"
                                                                style={{ width: '100%' }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Action Button: GENERATE */}
                                    {!isGenerating && !generatedImage && (
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
                                            <button
                                                onClick={handleGenerate}
                                                className="group relative px-10 py-5 bg-white text-black rounded-full font-bold tracking-wide hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all flex items-center gap-4 overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-white to-amber-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                <Wand2 size={24} className="relative z-10 group-hover:rotate-12 transition-transform text-amber-600" />
                                                <span className="relative z-10">TRANSFORM SPACE</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Action Buttons: RESULT */}
                                    {generatedImage && (
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
                                            <button
                                                onClick={() => setGeneratedImage(null)}
                                                className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all border border-white/20 hover:scale-110 active:scale-95"
                                                title="Reset"
                                            >
                                                <Undo2 size={20} />
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="h-14 px-8 rounded-full bg-amber-500 text-white font-bold tracking-wide flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95"
                                            >
                                                <Download size={20} />
                                                <span>DOWNLOAD HD</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Header Controls for Canvas */}
                                    {selectedImage && (
                                        <div className="absolute top-6 right-6 flex items-center gap-2 z-50">
                                            <button
                                                onClick={toggleFullscreen}
                                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10"
                                            >
                                                <Maximize2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedFile(null)
                                                    setSelectedImage(null)
                                                    setGeneratedImage(null)
                                                }}
                                                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-red-500 border border-white/10 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Eraser Overlay */}
                                    {isEraserMode && selectedImage && (
                                        <EraserCanvas
                                            width={imageDimensions.width || 800} // Fallback
                                            height={imageDimensions.height || 600}
                                            imageSrc={selectedImage}
                                            onClose={() => setIsEraserMode(false)}
                                            onApply={handleInpainting}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* RIGHT SIDEBAR: CREATIVITY & LIGHTING */}
                <aside className={`
                    absolute lg:relative z-40 h-full w-80 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-l border-white/10 transition-all duration-300 flex flex-col right-0
                    ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'}
                `}>
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* Creativity Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Zap size={14} /> Creativity
                                </label>
                                <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded dark:text-gray-300">
                                    {creativityLevel}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={creativityLevel}
                                onChange={(e) => setCreativityLevel(Number(e.target.value))}
                                className="w-full accent-amber-500 h-1.5 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                                <span>Subtle</span>
                                <span>Balanced</span>
                                <span>Wild</span>
                            </div>
                        </div>

                        {/* Lighting Modes - VISUAL CARDS */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Sun size={14} /> Lighting Atmosphere
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {LIGHTING_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setActiveLighting(mode)}
                                        className={`group relative p-3 rounded-xl border text-left transition-all duration-300 overflow-hidden ${activeLighting.id === mode.id
                                            ? 'ring-1 ring-amber-500 bg-black/5 dark:bg-white/5 border-amber-500/50'
                                            : 'hover:bg-black/5 dark:hover:bg-white/5 border-transparent border'
                                            }`}
                                    >
                                        {/* Gradient Background for active state */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-100 transition-opacity ${activeLighting.id === mode.id ? 'opacity-100' : ''}`}></div>

                                        <div className="relative z-10">
                                            <div className="mb-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-sm border border-white/10">
                                                {mode.icon}
                                            </div>
                                            <div className="text-sm font-bold leading-tight mb-0.5 dark:text-gray-200">{mode.name}</div>
                                            <div className="text-[10px] opacity-60 leading-tight dark:text-gray-400">{mode.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </aside>
            </div>
        </div>
    )
}
