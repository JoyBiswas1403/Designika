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
import { generateInpainting, checkPredictionStatus } from '../services/ai.service';

export const startInpainting = async (req: Request, res: Response) => {
    try {
        // We expect 'image' and 'mask' files from Multer
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files || !files['image'] || !files['mask']) {
            res.status(400).json({ error: 'Both image and mask files are required' });
            return;
        }

        const imageFile = files['image'][0];
        const maskFile = files['mask'][0];
        const prompt = req.body.prompt || "remove object, clean background";

        const prediction = await generateInpainting(imageFile.path, maskFile.path, prompt);

        res.json(prediction);

    } catch (error) {
        console.error("Inpainting Controller Error:", error);
        res.status(500).json({ error: "Failed to start inpainting job" });
    }
};

export const getInpaintingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const status = await checkPredictionStatus(id);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: "Failed to check status" });
    }
};
