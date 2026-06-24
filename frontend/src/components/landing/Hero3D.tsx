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
