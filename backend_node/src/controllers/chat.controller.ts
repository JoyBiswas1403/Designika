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
import { generateChatResponse } from '../services/chat.service';

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const reply = await generateChatResponse(message, history);

        res.json({ reply });
    } catch (error: any) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};
