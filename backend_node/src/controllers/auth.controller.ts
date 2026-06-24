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
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, full_name } = req.body;

        // Check existing
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });

        if (existing) {
            return res.status(400).json({ detail: "Email or Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                username: username || email.split('@')[0],
                hashed_password: hashedPassword,
                profile_picture: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
                is_active: true
            }
        });

        // Create Token
        const token = jwt.sign({ sub: user.email, id: user.id }, SECRET, { expiresIn: '7d' });

        res.json({
            access_token: token,
            token_type: "bearer",
            user: { id: user.id, email: user.email, username: user.username }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Registration failed" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // Handle both JSON body and x-www-form-urlencoded (FastAPI OAuth2PasswordRequestForm style)
        // If frontend sends FormData matching standard OAuth2:
        const username = req.body.username || req.body.email;
        const password = req.body.password;

        const user = await prisma.user.findFirst({
            where: { email: username } // Allowing login by email as username
        });

        if (!user || !bcrypt.compareSync(password, user.hashed_password)) {
            return res.status(401).json({ detail: "Incorrect email or password" });
        }

        const token = jwt.sign({ sub: user.email, id: user.id }, SECRET, { expiresIn: '7d' });

        res.json({
            access_token: token,
            token_type: "bearer"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: "Login failed" });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ detail: "Not authenticated" });
    res.json(user);
};
