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

import React, { useRef, useState } from 'react';

interface Props {
    width: number;
    height: number;
    onClose: () => void;
    onApply: (maskBlob: Blob) => void;
    imageSrc: string; // Background image for reference
}

export const EraserCanvas: React.FC<Props> = ({ width, height, onClose, onApply, imageSrc }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // Reset path
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'white';
        // We draw WHITE on a transparent background. 
        // The backend mask usually expects white = inpaint area, black = keep.
        // We will composite this later: Black background + White strokes.

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleApply = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a separate canvas for the final mask (Black BG + White Strokes)
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const mCtx = maskCanvas.getContext('2d');
        if (!mCtx) return;

        // Fill black (keep area)
        mCtx.fillStyle = 'black';
        mCtx.fillRect(0, 0, width, height);

        // Draw the strokes from the drawing canvas (which are white)
        mCtx.drawImage(canvas, 0, 0);

        maskCanvas.toBlob((blob) => {
            if (blob) onApply(blob);
        }, 'image/png');
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative">
                {/* Background Image Reference */}
                <img
                    src={imageSrc}
                    width={width}
                    height={height}
                    style={{ width: '100%', height: 'auto', maxHeight: '80vh' }}
                    className="opacity-50 pointer-events-none"
                    alt="Reference"
                />

                {/* Drawing Canvas */}
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="absolute inset-0 touch-none cursor-crosshair border-2 border-amber-500/50"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ width: '100%', height: '100%' }}
                />

                {/* Tools */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 bg-black/90 px-6 py-3 rounded-full border border-white/20 shadow-xl">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white uppercase font-bold">Brush Size</span>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-24 accent-amber-500"
                        />
                    </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <button onClick={onClose} className="px-6 py-2 rounded-full bg-white text-black font-bold hover:bg-gray-200">Cancel</button>
                    <button onClick={handleApply} className="px-6 py-2 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-600">Remove Object</button>
                </div>
            </div>
        </div>
    );
};
