/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Download, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui'
import ComparisonSlider from '../components/ui/ComparisonSlider'
import { ShutterLogo } from '../components/ui/ShutterLogo'

// Mock Data
const HISTORY_ITEMS = [
    {
        id: '1',
        date: 'Today, 2:30 PM',
        before: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
        after: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
        style: 'Minimalist Zen',
        room: 'Living Room'
    },
    {
        id: '2',
        date: 'Yesterday',
        before: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80',
        after: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
        style: 'Industrial Loft',
        room: 'Bedroom'
    },
    {
        id: '3',
        date: 'Oct 24',
        before: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
        after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
        style: 'Cyberpunk',
        room: 'Kitchen'
    }
]

export default function HistoryPage() {
    const [selectedItem, setSelectedItem] = useState(HISTORY_ITEMS[0])

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 flex flex-col md:flex-row overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 aurora-bg pointer-events-none opacity-30"></div>
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            {/* Sidebar List */}
            <div className="w-full md:w-96 border-r border-white/10 bg-black/40 backdrop-blur-md flex flex-col z-20 h-screen">
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2 mb-8 group">
                        <ShutterLogo />
                        <span className="text-xl font-serif tracking-tight font-semibold group-hover:text-amber-100 transition-colors">Designika</span>
                    </Link>
                    <Link to="/transform">
                        <Button variant="ghost" size="sm" className="pl-0 gap-2 hover:bg-transparent text-white/60 hover:text-white">
                            <ArrowLeft size={16} /> Back to Studio
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest px-2 mb-2">Timeline</div>
                    {HISTORY_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedItem.id === item.id
                                ? 'bg-white/10 border-white/20 shadow-lg'
                                : 'bg-transparent border-transparent hover:bg-white/5'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-white">{item.style}</span>
                                <span className="text-xs text-white/40">{item.date}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-white/60">{item.room}</span>
                                <ChevronRight size={14} className={`text-white/40 transition-transform ${selectedItem.id === item.id ? 'translate-x-1' : ''}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 relative h-screen flex flex-col">
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 z-20 bg-black/20 backdrop-blur">
                    <div>
                        <h2 className="text-xl font-serif">{selectedItem.style}</h2>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Calendar size={12} /> {selectedItem.date} • {selectedItem.room}
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        className="gap-2"
                        onClick={() => alert("Exporting assets package... (feature coming soon)")}
                    >
                        <Download size={14} /> Export Assets
                    </Button>
                </header>

                <div className="flex-1 p-8 flex items-center justify-center overflow-hidden relative">
                    <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden glass-panel shadow-2xl relative">
                        <ComparisonSlider
                            before={selectedItem.before}
                            after={selectedItem.after}
                            label="ARCHIVED TRANSFORMATION"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
