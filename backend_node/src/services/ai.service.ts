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

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Style Definitions (Ported from Python)
const STYLE_PROMPTS: Record<string, string> = {
    "Modern Minimalist": "ultra-modern minimalist interior, clean lines, open space, neutral color palette, natural light, decluttered, honed concrete, matte white finishes, shadow gaps, high-end furniture",
    "Scandinavian": "Scandinavian interior design, hygge, cozy, light wood, white walls, functional furniture, soft textures, woolen throws, natural light, airy atmosphere",
    "Industrial": "industrial loft interior, exposed brick, concrete floors, metal accents, open pipes, large windows, leather furniture, raw materials, urban aesthetic",
    "Mid-Century Modern": "mid-century modern interior, organic curves, geometric shapes, teak wood, retro furniture, vibrant accent colors, functionality, icon designs",
    "Bohemian": "bohemian chic interior, eclectic mix, plants, patterned textiles, rattan furniture, vintage rugs, warm earth tones, relaxed atmosphere, macrame",
    "Contemporary": "contemporary interior design, sophisticated, current trends, fluid shapes, mixed textures, bold lighting, polished surfaces, curated art",
    "Traditional": "classic traditional interior, elegant, symmetrical, rich wood, ornate details, classic furniture, silk drapery, refined color palette, timeless",
    "Coastal": "coastal interior design, beach house vibe, breezy, light blue and white, natural linen, bleached wood, sea glass accents, relaxed luxury",
    "Art Deco": "art deco interior, glamour, geometric patterns, gold and brass accents, velvet furniture, bold contrast, symmetrical, luxury, opulent",
    "Farmhouse": "modern farmhouse interior, rustic charm, shiplap walls, reclaimed wood, vintage accessories, comfortable furniture, neutral palette, cozy",
    "Maximalist": "maximalist interior, bold colors, mixed patterns, curated collections, layered textures, personal style, vibrant, expressive, art-filled",
    "Biophilic": "biophilic interior design, connecting with nature, living walls, abundant indoor plants, natural materials, organic shapes, sunlight, wellness-focused"
};

// Lighting Modifiers
const LIGHTING_MODIFIERS: Record<string, string> = {
    "Natural": "soft natural daylight, sunbeams, airy atmosphere, environmental lighting",
    "Warm": "warm ambient lighting, golden hour, cozy atmosphere, tungsten lights, invitational",
    "Cool": "cool tone lighting, modern feel, crisp illumination, architectural lighting",
    "Dramatic": "dramatic chiaroscuro lighting, high contrast, moody shadows, cinematic lighting, pin spots",
    "Soft": "soft diffused north-facing window light with volumetric dust particles, gentle shadows, even illumination"
};

const BASE_NEGATIVE_PROMPT = "low quality, blurry, distorted, disfigured, text, watermark, signature, ugly, bad anatomy, bad perspective, pixelated, noise, artifacts, CGI look, plastic, smooth skin, cartoon, illustration, painting, drawing, fused fingers, missing limbs, bad proportions, duplicate, cropped, extra fingers, deformed, lowres, unknown, mutation";

const ULTRA_QUALITY_SUFFIX = ", interior architecture photography, Architectural Digest, Dezeen, award-winning, Unreal Engine 5 render, Octane Render, Ray Tracing, Global Illumination, 8k textures, highly detailed, sharp focus, depth of field, 8k, uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3";

export const generateDesign = async (
    imagePath: string,
    prompt: string,
    style: string = "Modern Minimalist",
    roomType: string = "Living Room",
    aiStrength: number = 0.75,
    lightingOption: string = "Soft"
) => {

    // Build Prompt
    const stylePrompt = STYLE_PROMPTS[style] || style;
    // Map frontend IDs (golden, nordic, etc.) to backend keys (Warm, Natural, etc.) 
    // OR just look up directly if keys match. 
    // Frontend logic sends IDs: 'golden', 'nordic', 'blue_hour', 'studio', 'warm_bulb'.
    // Backend keys are: 'Natural', 'Warm', 'Cool', 'Dramatic', 'Soft'.
    // We need a mapping or update keys. Since frontend is complex, let's map here.

    let selectedLighting = LIGHTING_MODIFIERS["Soft"];

    // Simple mapping logic
    const lightingMap: Record<string, string> = {
        'golden': 'Warm',
        'nordic': 'Natural',
        'blue_hour': 'Dramatic', // closest fit
        'studio': 'Cool',      // closest fit
        'warm_bulb': 'Warm'
    };

    const modifierKey = lightingMap[lightingOption] || "Soft";
    selectedLighting = LIGHTING_MODIFIERS[modifierKey];

    // Construct the final prompt
    const finalPrompt = `Professional photography of a ${stylePrompt} ${roomType}, ${prompt}. ${selectedLighting}${ULTRA_QUALITY_SUFFIX}`;

    console.log(`[AI Service] Generated Prompt: ${finalPrompt}`);

    try {
        // Upload image to Replicate (or use a file upload mechanism supported by the specific model)
        // For ControlNet/Img2Img models, we usually need to host the image or send it as data URI
        // Here assuming we might need to POST to Replicate's API directly.

        // Note: 'replicate' npm package is easier, but using raw axios for control here.
        // Actually, let's use the 'replicate' package if we installed it? we didn't.
        // We installed 'axios'. We'll use direct HTTP calls for now or quick-install replicate package in next step.
        // Let's stick to axios for raw control as per request "migration".

        // 1. We need to upload the file to a temp host or send as Base64 if supported. 
        // Replicate API usually expects a URL for the input 'image'.
        // For simplicity in this free-tier dev, we might use a data URI.

        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

        // Using standard Stable Diffusion ControlNet or similar model
        // Model: jaguar-micro/controlnet-canny or similar generic interior design model
        // Let's use a standard reliable one: stability-ai/sdxl with controlnet if available, or just img2img.
        // Using: timothybrooks/instruct-pix2pix for instruction based editing is good too.
        // Or the one from the Python code: "jagilley/controlnet-hough" or similar.

        // Let's assume a generic robust endpoint for now.
        const MODEL_VERSION = "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b"; // controlnet-scribble or similar

        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: MODEL_VERSION,
                input: {
                    image: base64Image,
                    prompt: finalPrompt,
                    negative_prompt: BASE_NEGATIVE_PROMPT,
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    condition_scale: aiStrength, // Strength of the control/input image
                    a_prompt: "best quality, extremely detailed, photo from Magazine",
                    n_prompt: BASE_NEGATIVE_PROMPT
                }
            },
            {
                headers: {
                    "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data; // This returns the prediction object. Requires polling for result.

    } catch (error: any) {
        console.error("Replicate Error Details:", JSON.stringify(error.response?.data || error.message, null, 2));
        console.error("Replicate Status:", error.response?.status);
        if (error.response?.status === 401) {
            console.error("CRITICAL: Replicate API Token is invalid or missing!");
        }
        throw new Error("AI Generation Failed: " + (error.response?.data?.detail || error.message));
    }
};



// Polling function
export const checkPredictionStatus = async (predictionId: string) => {
    const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
            headers: {
                "Authorization": `Token ${REPLICATE_API_TOKEN}`,
            }
        }
    );
    return response.data;
};

// Inpainting (Magic Eraser)
export const generateInpainting = async (
    imagePath: string,
    maskPath: string, // We will receive the mask as a separate file
    prompt: string = "remove object, clean background"
) => {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

        const maskBuffer = fs.readFileSync(maskPath);
        const base64Mask = `data:image/jpeg;base64,${maskBuffer.toString('base64')}`;

        // Model: stability-ai/stable-diffusion-inpainting
        // Version: c28b92a7ecd66eee4aefcd8e94eb9e7f6c3805d5f06038165407fb5cb355ba67
        const MODEL_VERSION = "c28b92a7ecd66eee4aefcd8e94eb9e7f6c3805d5f06038165407fb5cb355ba67";

        console.log(`[AI Service] Starting Inpainting...`);

        const response = await axios.post(
            "https://api.replicate.com/v1/predictions",
            {
                version: MODEL_VERSION,
                input: {
                    image: base64Image,
                    mask: base64Mask,
                    prompt: prompt,
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                }
            },
            {
                headers: {
                    "Authorization": `Token ${REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error: any) {
        console.error("Replicate Inpainting Error:", error.response?.data || error.message);
        throw new Error("Inpainting Failed");
    }
};
