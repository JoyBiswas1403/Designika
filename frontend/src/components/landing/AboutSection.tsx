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

import { CheckCircle2 } from 'lucide-react';

export const AboutSection = () => {
    return (
        <section className="py-24 px-6 relative overflow-hidden bg-slate-50 dark:bg-white/5 border-y border-slate-200 dark:border-white/5">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <h2 className="text-4xl md:text-5xl font-serif" style={{ color: 'var(--text-primary)' }}>
                        We believe design should be <span className="italic text-amber-500">intuitive</span>.
                    </h2>
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Designika was born from a simple frustration: visualizing potential is hard. Sketches are abstract, and 3D modeling takes days.
                        We built an engine that understands the language of interior design—light, texture, and flow—to bridge the gap between imagination and reality.
                    </p>

                    <div className="space-y-4 pt-4">
                        {[
                            "GPU-accelerated rendering engine",
                            "Privacy-first architecture",
                            "Collaborative by default"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="text-emerald-500" size={20} />
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 flex gap-8">
                        <div>
                            <div className="text-4xl font-bold font-serif mb-1" style={{ color: 'var(--text-primary)' }}>10k+</div>
                            <div className="text-sm uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Designs Generated</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold font-serif mb-1" style={{ color: 'var(--text-primary)' }}>98%</div>
                            <div className="text-sm uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>User Satisfaction</div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10 group">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none"></div>
                        <img
                            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
                            alt="Design Studio"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -bottom-6 -left-6 bg-white dark:bg-black p-6 rounded-2xl shadow-xl max-w-xs border border-slate-100 dark:border-white/10 hidden md:block z-20">
                        <p className="font-serif italic text-lg leading-snug" style={{ color: 'var(--text-primary)' }}>
                            "The most powerful tool in our firm's arsenal."
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Sarah Jenkins</div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Lead Architect, Studio A</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
