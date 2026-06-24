/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { Aperture } from 'lucide-react';

export const ShutterLogo = () => {
    return (
        <div className="relative group cursor-pointer inline-flex items-center justify-center">
            {/* Glow/Background Effect */}
            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 rounded-full transition-all duration-300 scale-150 blur-sm"></div>

            {/* Rotating Aperture */}
            <div className="relative transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180 group-hover:scale-110 group-hover:text-amber-500">
                <Aperture size={28} strokeWidth={1.5} />
            </div>

            {/* Center Dot (Lens Reflection) */}
            <div className="absolute w-1.5 h-1.5 bg-white/0 group-hover:bg-amber-500 rounded-full transition-all duration-500 delay-100 z-10"></div>
        </div>
    );
};
