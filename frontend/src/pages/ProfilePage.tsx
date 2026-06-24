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

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    Settings, Grid, Heart, Bookmark, Calendar, LogOut, CircleUser
} from 'lucide-react'
import clsx from 'clsx'
import { Button, ThemeToggle, Modal } from '../components/ui'
import { ShutterLogo } from '../components/ui/ShutterLogo'
import { MasonryGallery } from '../components/gallery'
import { useAuthStore } from '../store/auth'
import { designsApi } from '../lib/api'

type Tab = 'designs' | 'liked' | 'saved'

export default function ProfilePage() {
    const { userId } = useParams()
    void userId;

    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const [activeTab, setActiveTab] = useState<Tab>('designs')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [designs, setDesigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const { data } = await designsApi.list()
                const formattedDesigns = data.map((d: any) => ({
                    id: d.id,
                    imageUrl: d.original_image_url,
                    title: d.title || 'Untitled',
                    style: d.style || 'Unknown',
                    author: { id: user?.id || '', name: user?.username || 'Me', avatarUrl: user?.profilePicture },
                    likes: 0,
                    comments: 0,
                    views: 0,
                    aspectRatio: 1
                }))
                setDesigns(formattedDesigns)
            } catch (error) {
                console.error("Failed to load designs", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            fetchDesigns()
        }
    }, [user])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-white/40 font-serif">Loading profile...</div>
    }

    const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
        { key: 'designs', label: 'Designs', icon: <Grid className="w-4 h-4" />, count: designs.length },
        { key: 'liked', label: 'Liked', icon: <Heart className="w-4 h-4" />, count: 0 },
        { key: 'saved', label: 'Saved', icon: <Bookmark className="w-4 h-4" />, count: 0 },
    ]

    return (
        <div className="relative min-h-screen overflow-hidden selection:bg-amber-500/30" style={{ color: 'var(--text-primary)' }}>
            <div className="fixed inset-0 aurora-bg pointer-events-none opacity-50"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            {/* Global Nav */}
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
                    <div className="w-px h-4 bg-white/10"></div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
                        <LogOut size={14} /> Sign Out
                    </Button>
                </div>
            </nav>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">

                {/* Profile Header Card */}
                <div className="glass-panel p-8 rounded-[2rem] border border-white/10 mb-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="w-32 h-32 rounded-full border-4 border-white/5 object-cover shadow-2xl"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-white/5 bg-white/5 flex items-center justify-center text-white/80 shadow-2xl">
                                    <CircleUser size={64} strokeWidth={1} />
                                </div>
                            )}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-black/50"></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2">
                            <h1 className="text-4xl font-serif font-medium tracking-tight mb-1">{user.username}</h1>
                            {user.bio ? (
                                <p className="text-lg font-light leading-relaxed max-w-xl opacity-70">{user.bio}</p>
                            ) : (
                                <p className="text-sm opacity-40 italic">No bio yet. Start designing to express yourself.</p>
                            )}

                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50">
                                    <Calendar size={14} /> Member since 2024
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-4 rounded-full border border-white/10 hover:bg-white/5 text-xs"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <Settings size={12} className="mr-2" /> Edit Profile
                                </Button>
                            </div>
                        </div>

                        {/* Stats - Compact */}
                        <div className="flex gap-8 md:border-l md:border-white/10 md:pl-8">
                            <div className="text-center">
                                <div className="text-2xl font-serif">{designs.length}</div>
                                <div className="text-[10px] uppercase tracking-widest opacity-40">Designs</div>
                            </div>
                            <div className="text-center opacity-40">
                                <div className="text-2xl font-serif">0</div>
                                <div className="text-[10px] uppercase tracking-widest">Followers</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="fle items-center justify-between mb-8">
                    <div className="inline-flex p-1 rounded-full border border-white/10 bg-black/20 backdrop-blur">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={clsx(
                                    'flex items-center gap-2 px-6 py-2.5 rounded-full transition-all text-sm font-medium',
                                    activeTab === tab.key
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={clsx("text-[10px] ml-1 px-1.5 rounded-full", activeTab === tab.key ? "bg-black/10" : "bg-white/10")}>{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-serif">Curating your space...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'designs' && (
                                designs.length > 0 ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <MasonryGallery
                                            items={designs}
                                            columns={3}
                                            onItemClick={(item) => console.log('View design:', item.id)}
                                            onLike={(id) => console.log('Like:', id)}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-32 rounded-[2rem] border border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                            <Grid className="opacity-20" size={32} />
                                        </div>
                                        <h3 className="text-xl font-serif">Your portfolio is empty</h3>
                                        <p className="opacity-40 max-w-xs leading-relaxed mb-4">Start your journey by transforming your first room into a masterpiece.</p>
                                        <Link to="/transform">
                                            <Button>Create New Design</Button>
                                        </Link>
                                    </div>
                                )
                            )}

                            {activeTab === 'liked' && (
                                <div className="text-center py-32 rounded-[2rem] border border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center gap-4 animate-in fade-in">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                        <Heart className="opacity-20" size={32} />
                                    </div>
                                    <h3 className="text-xl font-serif">No liked designs yet</h3>
                                    <p className="opacity-40 max-w-xs leading-relaxed mb-4">Explore the gallery and find inspiration that speaks to you.</p>
                                    <Link to="/gallery">
                                        <Button variant="secondary">Explore Gallery</Button>
                                    </Link>
                                </div>
                            )}

                            {activeTab === 'saved' && (
                                <div className="text-center py-32 rounded-[2rem] border border-dashed border-white/5 bg-white/5 flex flex-col items-center justify-center gap-4 animate-in fade-in">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                        <Bookmark className="opacity-20" size={32} />
                                    </div>
                                    <h3 className="text-xl font-serif">No saved collections</h3>
                                    <p className="opacity-40 max-w-xs leading-relaxed">Organize your favorite concepts into collections for your next project.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
                            Profile editing is currently in beta. Visual changes here will be saved to your session.
                        </div>

                        <div className="space-y-4 opacity-50 pointer-events-none">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider opacity-60">Display Name</label>
                                <input type="text" value={user.username} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" readOnly />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider opacity-60">Bio</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 h-24" readOnly defaultValue={user.bio || "Interior design enthusiast."}></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button disabled>Save Changes</Button>
                        </div>
                    </div>
                </Modal>
            </main>
        </div>
    )
}



