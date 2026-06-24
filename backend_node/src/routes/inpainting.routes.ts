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

import express from 'express';
import { startInpainting, getInpaintingStatus } from '../controllers/inpainting.controller';
import { authenticate } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = express.Router();

router.post(
    '/',
    authenticate,
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mask', maxCount: 1 }]),
    startInpainting
);

router.get('/:id', authenticate, getInpaintingStatus);

export default router;
