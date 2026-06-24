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


export default function ScannerOverlay() {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"></div>
            <div className="w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] absolute animate-scan top-0 left-0 z-20"></div>
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:40px_40px] perspective-[1000px] rotate-x-12 opacity-30"></div>
        </div>
    )
}
