/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { Link } from 'react-router-dom'
import { Search, Filter, Heart, MessageCircle, Eye } from 'lucide-react'
import { Button } from '../components/ui'
import { ShutterLogo } from '../components/ui/ShutterLogo'

// Mock Data (preserving existing data logic but styled)
const STYLES = [
    'Modern Minimalist', 'Scandinavian', 'Industrial', 'Mid-Century Modern',
    'Bohemian', 'Contemporary', 'Traditional', 'Coastal'
]

const GALLERY_ITEMS = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
        title: 'Zen Living Room',
        author: 'Sarah J.',
        likes: 245,
        style: 'Minimalist'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
        title: 'Modern Loft',
        author: 'Mike C.',
        likes: 189,
        style: 'Industrial'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
        title: 'Scandi Bedroom',
        author: 'Emma W.',
        likes: 320,
        style: 'Scandinavian'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
        title: 'Boho Chic Corner',
        author: 'Alex R.',
        likes: 156,
        style: 'Bohemian'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80',
        title: 'Art Deco Lounge',
        author: 'David K.',
        likes: 412,
        style: 'Art Deco'
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&q=80',
        title: 'Eclectic Studio',
        author: 'Sophie M.',
        likes: 198,
        style: 'Eclectic'
    },
    {
        id: 7,
        image: 'https://images.unsplash.com/photo-1616486029423-aaa478965c96?w=800&q=80',
        title: 'Classic Dining',
        author: 'James L.',
        likes: 275,
        style: 'Traditional'
    },
    {
        id: 8,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        title: 'Biophilic Workspace',
        author: 'Anna P.',
        likes: 340,
        style: 'Biophilic'
    },
    {
        id: 9,
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
        title: 'Retro Kitchen',
        author: 'Chris T.',
        likes: 230,
        style: 'Mid-Century'
    },
    {
        id: 10,
        image: 'https://images.unsplash.com/photo-1595859703053-98eaf739c969?w=800&q=80',
        title: 'Cozy Reading Nook',
        author: 'Lisa B.',
        likes: 180,
        style: 'Scandinavian'
    },
    {
        id: 11,
        image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
        title: 'Farmhouse Patio',
        author: 'Tom H.',
        likes: 210,
        style: 'Farmhouse'
    },
    {
        id: 12,
        image: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=800&q=80',
        title: 'Vibrant Colors',
        author: 'Maria G.',
        likes: 295,
        style: 'Maximalist'
    }
]

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            {/* Background */}
            <div className="fixed inset-0 aurora-bg pointer-events-none opacity-50"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            {/* Nav */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-2 group">
                    <ShutterLogo />
                    <span className="text-xl font-serif tracking-tight font-semibold group-hover:text-amber-100 transition-colors">Designika</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/transform">
                        <Button variant="secondary" size="sm">Open Studio</Button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20">

                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">Curated Spaces</h1>
                        <p className="text-white/40 max-w-md">Discover the finest AI-generated interiors from our community of visionary designers.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search styles..."
                                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all w-48 focus:w-64"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-full"
                            onClick={() => alert("Advanced filters coming soon!")}
                        >
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </Button>
                    </div>
                </div>

                {/* Tags Row */}
                <div className="flex gap-2 overflow-x-auto pb-6 mb-2 no-scrollbar">
                    <button className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider whitespace-nowrap">Trending</button>
                    {STYLES.map(style => (
                        <button key={style} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-colors whitespace-nowrap">
                            {style}
                        </button>
                    ))}
                </div>

                {/* Masonry Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {GALLERY_ITEMS.map((item) => (
                        <div key={item.id} className="break-inside-avoid group relative">
                            <div className="relative rounded-2xl overflow-hidden glass-panel p-0 border-0">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">{item.style}</div>
                                            <h3 className="text-lg font-serif font-medium">{item.title}</h3>
                                            <div className="text-xs text-white/60 mt-1">by {item.author}</div>
                                        </div>
                                        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Meta (visible on desktop hover or mobile) */}
                            <div className="mt-3 flex items-center justify-between px-2 text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1 hover:text-white cursor-pointer"><Heart size={12} /> {item.likes}</span>
                                    <span className="flex items-center gap-1 hover:text-white cursor-pointer"><MessageCircle size={12} /> 12</span>
                                </div>
                                <span className="flex items-center gap-1"><Eye size={12} /> 1.2k</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-20 text-center">
                    <Button variant="ghost" className="text-white/40 hover:text-white uppercase tracking-widest text-xs">
                        Load More Inspiration
                    </Button>
                </div>
            </main>
        </div>
    )
}
