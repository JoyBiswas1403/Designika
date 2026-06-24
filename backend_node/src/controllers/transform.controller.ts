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

import { Request, Response } from 'express';
import { generateDesign, checkPredictionStatus } from '../services/ai.service';
import prisma from '../utils/prisma';
import axios from 'axios';

// Mock Job Store (In real app, use Redis or DB)
// For dev, we rely on Replicate ID as Job ID, but we need to store context (design_id) somewhere?
// We can assume the prediction ID is enough to fetch status.

export const queueTransform = async (req: Request, res: Response) => {
    try {
        const { design_id, style, room_type, intensity } = req.body;

        // 1. Fetch the design to get the image path/url
        const design = await prisma.design.findUnique({ where: { id: design_id } });

        if (!design) return res.status(404).json({ detail: "Design not found" });

        // Read local path from metadata if we stored it
        let imagePath = '';
        if (design.metadata_json) {
            const meta = JSON.parse(design.metadata_json);
            if (meta.local_path) imagePath = meta.local_path;
        }
        // Fallback or if using URL (not implemented in this valid local file check)
        if (!imagePath) {
            return res.status(400).json({ detail: "Original image file not found" });
        }

        // 2. Call AI Service (Start Prediction)
        const prediction = await generateDesign(
            imagePath,
            "", // Prompt built inside service based on style
            style,
            room_type || design.room_type,
            intensity || 0.75,
            req.body.lighting // Pass lighting parameter
        );

        // 3. Return Job ID
        res.json({
            job_id: prediction.store_id || prediction.id, // Using prediction ID as Job ID, handle minimal response
            status: prediction.status,
            estimated_seconds: 15
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Failed to queue transformation" });
    }
};

export const getJobStatus = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const status = await checkPredictionStatus(jobId);

        const response: any = {
            id: jobId,
            job_type: 'transform',
            status: status.status === 'succeeded' ? 'completed' : status.status === 'processing' ? 'processing' : 'failed',
            progress: status.status === 'succeeded' ? 100 : 50,
        };

        if (status.status === 'succeeded') {
            // Replicate returns "output": "url" or ["url"]
            const outputUrl = Array.isArray(status.output) ? status.output[0] : status.output;

            // Need to convert to base64 for frontend compatibility (as per API check)
            // Or change frontend to accept URL.
            // Let's try to fetch and convert.
            try {
                const imgResp = await axios.get(outputUrl, { responseType: 'arraybuffer' });
                const base64 = Buffer.from(imgResp.data, 'binary').toString('base64');

                response.result = {
                    images: [{
                        index: 0,
                        image_b64: base64,
                        quality: { overall: 0.95 }
                    }],
                    quality_scores: [0.95]
                };
            } catch (e) {
                console.error("Failed to download result image", e);
                response.status = 'failed';
                response.error = "Failed to download result";
            }
        } else if (status.error) {
            response.status = 'failed';
            response.error = status.error;
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ detail: "Could not check status" });
    }
}

// Stubs for analysis endpoints to prevent 404s
export const analyzeDesign = async (req: Request, res: Response) => {
    res.json({
        design_id: req.body.design_id,
        analysis: {
            colors: { dominant: [{ hex: "#FFFFFF", percentage: 50 }] },
            lighting: { description: "Simulated Analysis" },
            style_recommendations: []
        }
    });
};

export const analyzeClutter = async (req: Request, res: Response) => {
    res.json({
        design_id: req.body.design_id,
        analysis: { clutter_score: 0.1, detected_items: [], recommendations: [], is_mock: true }
    });
};

export const declutter = async (req: Request, res: Response) => {
    res.json({ success: false, message: "Declutter not implemented in Node backend yet" });
};

export const getStyles = async (req: Request, res: Response) => {
    // Return static styles list
    res.json([
        { key: "Modern Minimalist", name: "Modern Minimalist", prompt: "clean..." },
        { key: "Scandinavian", name: "Scandinavian", prompt: "cozy..." },
        { key: "Industrial", name: "Industrial", prompt: "raw..." },
        // ... add more if needed
    ]);
};

export const getLightingOptions = async (req: Request, res: Response) => {
    res.json([{ key: "Natural", name: "Natural", description: "Sunlight" }]);
};

export const getTimeOptions = async (req: Request, res: Response) => {
    res.json([{ key: "Morning", name: "Morning", description: "Bright" }]);
};
