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
import prisma from '../utils/prisma';

export const createDesign = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ detail: "No image provided" });
        }

        // @ts-ignore
        const userId = req.user.id;

        // In a real app, upload req.file.path to S3/Cloudinary and get URL.
        // For local dev, we'll serve it statically or just store the path.
        // Let's assume we serve 'uploads' folder statically.
        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

        const design = await prisma.design.create({
            data: {
                user_id: userId,
                title: (req.body.title as string) || 'Untitled Design',
                room_type: (req.body.room_type as string) || 'Unknown',
                style: (req.body.style as string) || 'None',
                original_image_url: imageUrl, // Storing local URL
                // Store local path in metadata for the AI service to read if needed
                metadata_json: JSON.stringify({ local_path: req.file.path }),
                style_tags: JSON.stringify([]), // Initialize as empty JSON array
                transformed_image_urls: JSON.stringify([]) // Initialize as empty JSON array
            }
        });

        res.json(design);

    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Failed to upload design" });
    }
};

export const getDesign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const design = await prisma.design.findUnique({ where: { id } });
        if (!design) return res.status(404).json({ detail: "Design not found" });
        res.json(design);
    } catch (error) {
        res.status(500).json({ detail: "Error fetching design" });
    }
};

export const listDesigns = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const designs = await prisma.design.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        res.json(designs);
    } catch (error) {
        res.status(500).json({ detail: "Error fetching designs" });
    }
};
