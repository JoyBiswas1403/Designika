/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { Wand2, Zap, Layers, Image, Share2, Shield, MousePointer2 } from 'lucide-react';

const FEATURES = [
    {
        title: "Instant Transformation",
        description: "Turn sketches into photorealistic renders in seconds, not hours.",
        icon: <Zap className="w-6 h-6 text-amber-500" />,
        className: "col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"
    },
    {
        title: "Style Transfer",
        description: "12+ curated styles from Zen Minimalist to Bohemian Chic.",
        icon: <Wand2 className="w-6 h-6 text-cyan-500" />,
        className: "col-span-1 bg-slate-50 dark:bg-slate-900/50"
    },
    {
        title: "Structure Preservation",
        description: "AI that respects walls, windows, and floors.",
        icon: <Layers className="w-6 h-6 text-purple-500" />,
        className: "col-span-1 bg-slate-50 dark:bg-slate-900/50"
    },
    {
        title: "Smart Fill",
        description: "Automatically furnish empty rooms with spatially aware furniture.",
        icon: <Image className="w-6 h-6 text-emerald-500" />,
        className: "col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900/50"
    },
    {
        title: "Secure & Private",
        description: "Your designs are yours. Enterprise-grade security.",
        icon: <Shield className="w-6 h-6 text-red-500" />,
        className: "col-span-1 bg-slate-50 dark:bg-slate-900/50"
    },
    {
        title: "One-Click Export",
        description: "Download 4K ready-to-present renders.",
        icon: <Share2 className="w-6 h-6 text-blue-500" />,
        className: "col-span-1 bg-slate-50 dark:bg-slate-900/50"
    }
];

export const BentoFeatures = () => {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-serif mb-6">Designed for Speed & Precision</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Everything you need to visualize spaces, packed into one powerful studio.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
                {FEATURES.map((feature, idx) => (
                    <div
                        key={idx}
                        className={`group relative p-8 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${feature.className}`}
                    >
                        {/* Background Hover Effect */}
                        <div className="absolute inset-0 bg-white/50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="mb-4 p-3 w-fit rounded-xl bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/5">
                                {feature.icon}
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>

                        {/* Special Image for Large Card */}
                        {feature.image && (
                            <div className="absolute right-[-20%] bottom-[-20%] w-[70%] h-[70%] rounded-tl-3xl overflow-hidden opacity-80 group-hover:scale-105 transition-transform duration-700 shadow-2xl skew-y-[-12deg] group-hover:skew-y-0">
                                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Interactive Cursor hint */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-300">
                            <MousePointer2 size={16} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
