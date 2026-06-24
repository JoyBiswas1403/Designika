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

import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Droplets, Sun, Palette, Heart, CircleUser } from 'lucide-react'
import ComparisonSlider from '../components/ui/ComparisonSlider'
import { ThemeToggle } from '../components/ui'
import { ShutterLogo } from '../components/ui/ShutterLogo'
import { AboutSection } from '../components/landing/AboutSection'
import { useAuthStore } from '../store/auth'

export default function HomePage() {
    const navigate = useNavigate()
    const { isAuthenticated, user, token } = useAuthStore()

    return (
        <div className="relative min-h-screen overflow-hidden selection:bg-amber-500/30" style={{ color: 'var(--text-primary)' }}>
            <div className="fixed inset-0 aurora-bg pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

            {/* Nav */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2 group">
                        <ShutterLogo />
                        <span className="text-xl font-serif tracking-tight font-semibold transition-colors group-hover:text-amber-500">Designika</span>
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <Link to="/gallery" className="text-sm font-medium transition-colors hover:opacity-100 opacity-70" style={{ color: 'var(--text-primary)' }}>Gallery</Link>

                    {/* Check if authenticated OR if a token exists (optimistic UI while fetching user) */}
                    {isAuthenticated || token ? (
                        <>
                            <Link to="/profile/me" className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-100 opacity-70 hover:text-amber-500" style={{ color: 'var(--text-primary)' }}>
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt={user?.username || 'User'} className="w-8 h-8 rounded-full border border-gray-300 object-cover" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CircleUser className="w-8 h-8" />
                                        <span className="hidden md:block">{user?.username || 'Profile'}</span>
                                    </div>
                                )}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium transition-colors hover:opacity-100 opacity-70" style={{ color: 'var(--text-primary)' }}>Sign In</Link>
                            <Link
                                to="/register"
                                className="group relative px-6 py-2 rounded-full border transition-all duration-300 text-sm font-medium overflow-hidden"
                                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                            >
                                <span className="relative z-10">Create Account</span>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* Hero Text */}
                    <div className="lg:col-span-7 space-y-10">


                        <h1 className="text-6xl md:text-8xl font-serif leading-[1.05] tracking-tight">
                            The art of living, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-100 to-amber-200">
                                reimagined.
                            </span>
                        </h1>

                        <p className="text-lg max-w-lg font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Transform cold sketches into breathable, livable sanctuaries.
                            A design companion that understands the soul of a room—lighting, texture, and feeling.
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <Link
                                to="/transform"
                                className="h-14 px-8 rounded-full bg-white text-black font-medium hover:bg-amber-50 transition-colors flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                            >
                                Start Designing <ArrowRight size={18} />
                            </Link>
                            <div className="flex items-center gap-3 px-6 text-sm text-white/40">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border border-black bg-gray-600"></div>
                                    ))}
                                </div>
                                <span>Used by 20k+ creators</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual - Floating Cards */}
                    <div className="lg:col-span-5 relative h-[500px]">
                        {/* Floating Palette Swatches - Visual Decor */}
                        <div className="absolute top-10 -left-12 z-20 animate-float" style={{ animationDelay: '2s' }}>
                            <div className="glass-panel p-3 rounded-2xl flex flex-col gap-2 rotate-[-6deg]">
                                <div className="w-8 h-8 rounded-full bg-[#D4C4B7]"></div>
                                <div className="w-8 h-8 rounded-full bg-[#8B7E74]"></div>
                                <div className="w-8 h-8 rounded-full bg-[#463F3A]"></div>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-[85%] aspect-[3/4] rounded-2xl overflow-hidden glass-panel p-2 rotate-2 animate-float hover:rotate-0 transition-transform duration-700">
                            <div className="w-full h-full rounded-xl overflow-hidden relative">
                                <ComparisonSlider
                                    before="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=90&w=2000"
                                    after="https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=90&w=2000"
                                    label=""
                                />
                                {/* Emotional Tag on Image */}
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                    <Heart size={12} className="text-white fill-white" />
                                    <span className="text-[10px] font-medium tracking-wide">LOVED BY CLIENTS</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute bottom-24 -left-4 glass-panel pl-4 pr-6 py-3 rounded-full flex items-center gap-3 animate-float border" style={{ animationDelay: '1s', borderColor: 'var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-100 flex items-center justify-center">
                                <Sparkles size={16} className="text-amber-900" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-secondary)' }}>Current Vibe</div>
                                <div className="text-sm font-serif italic" style={{ color: 'var(--text-primary)' }}>Parisian Warmth</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mood Board Grid Features */}
                <div className="mt-32 pb-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 px-2">
                        <h2 className="text-4xl font-serif" style={{ color: 'var(--text-primary)' }}>Designed for <br /> <span className="opacity-40">the visionary.</span></h2>
                        <p className="max-w-xs mt-4 md:mt-0" style={{ color: 'var(--text-secondary)' }}>Tools that feel like an extension of your own creative hand.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] md:h-[400px]">
                        {/* Card 1: Texture & Feeling */}
                        <div className="glass-panel p-8 rounded-[2rem] md:col-span-2 flex flex-col justify-between group overflow-hidden relative border hover:border-opacity-100 transition-all" style={{ borderColor: 'var(--glass-border)' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 to-black z-0 opacity-80"></div>
                            {/* Abstract Texture BG */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=90&w=1600')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center mb-6">
                                    <Droplets size={20} className="text-white/80" />
                                </div>
                                <div className="px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-widest bg-black/20 backdrop-blur text-white">
                                    Tactile Engine
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-serif mb-2 text-white">Deep Texture</h3>
                                <p className="text-white/60 max-w-sm font-light">
                                    It’s not just pixels. We simulate how light interacts with velvet, grain, and stone to evoke a genuine feeling of touch.
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Light & Atmosphere */}
                        <div className="glass-panel p-8 rounded-[2rem] flex flex-col justify-center items-center group hover:bg-white/5 transition-colors relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-200/20 to-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10">
                                <Sun size={32} className="text-amber-100" />
                            </div>
                            <div className="text-3xl font-serif mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Golden<br />Hour</div>
                            <div className="text-xs uppercase tracking-widest text-center mt-2" style={{ color: 'var(--text-secondary)' }}>Atmosphere Control</div>
                        </div>

                        {/* Card 3: Inspiration */}
                        <div
                            onClick={() => navigate('/transform')}
                            className="glass-panel p-8 rounded-[2rem] md:col-span-3 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Palette size={24} style={{ color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium mb-1 font-serif" style={{ color: 'var(--text-primary)' }}>Curated Palettes</h3>
                                    <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>Export complete mood boards with hex codes and material references.</p>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AboutSection />
        </div >
    )
}
