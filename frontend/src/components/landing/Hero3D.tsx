/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Loader2 } from 'lucide-react';

export const Hero3D = () => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="w-full h-[500px] lg:h-[600px] relative">
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 transition-opacity duration-500">
                    <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                </div>
            )}

            {/* Spline Scene - Using a public "Room" scene URL or similar generic 3D asset */}
            {/* Note: In production, replace with your specific Spline export URL */}
            <Spline
                scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full"
                renderOnDemand={true}
            />

            {/* Fallback/Overlay to ensure text readability if 3D is too bright */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent pointer-events-none mix-blend-multiply"></div>
        </div>
    );
};
