import os
import replicate
# import google.generativeai as genai (Removed)
from dotenv import load_dotenv

load_dotenv()

# Constants (Ported from Node.js implementation)
STYLE_PROMPTS = {
    "Minimalist": "ultra-modern minimalist interior, clean lines, open space, neutral color palette, natural light, decluttered, honed concrete, matte white finishes, high-end furniture",
    "Scandi": "Scandinavian interior design, hygge, cozy, light wood, white walls, functional furniture, soft textures, woolen throws, natural light, airy atmosphere",
    "Industrial": "industrial loft interior, exposed brick, concrete floors, metal accents, open pipes, large windows, leather furniture, raw materials, urban aesthetic",
    "Mid-Century": "mid-century modern interior, organic curves, geometric shapes, teak wood, retro furniture, vibrant accent colors, functionality, icon designs",
    "Boho": "bohemian chic interior, eclectic mix, plants, patterned textiles, rattan furniture, vintage rugs, warm earth tones, relaxed atmosphere, macrame",
    "Contemporary": "contemporary interior design, sophisticated, current trends, fluid shapes, mixed textures, bold lighting, polished surfaces, curated art",
    "Classic": "classic traditional interior, elegant, symmetrical, rich wood, ornate details, classic furniture, silk drapery, refined color palette, timeless",
    "Coastal": "coastal interior design, beach house vibe, breezy, light blue and white, natural linen, bleached wood, sea glass accents, relaxed luxury",
    "Art Deco": "art deco interior, glamour, geometric patterns, gold and brass accents, velvet furniture, bold contrast, symmetrical, luxury, opulent",
    "Farmhouse": "modern farmhouse interior, rustic charm, shiplap walls, reclaimed wood, vintage accessories, comfortable furniture, neutral palette, cozy",
    "Zen": "japanese zen interior, biophilic, connecting with nature, living walls, abundant indoor plants, natural materials, organic shapes, sunlight, wellness-focused",
    "Maximalist": "maximalist interior, bold colors, mixed patterns, curated collections, layered textures, personal style, vibrant, expressive, art-filled"
}

LIGHTING_MODIFIERS = {
    "Natural": "soft natural daylight, sunbeams, airy atmosphere, environmental lighting",
    "Warm": "warm ambient lighting, golden hour, cozy atmosphere, tungsten lights, invitational",
    "Cool": "cool tone lighting, modern feel, crisp illumination, architectural lighting",
    "Dramatic": "dramatic chiaroscuro lighting, high contrast, moody shadows, cinematic lighting, pin spots",
    "Soft": "soft diffused north-facing window light with volumetric dust particles, gentle shadows, even illumination"
}

BASE_NEGATIVE_PROMPT = "low quality, blurry, distorted, disfigured, text, watermark, signature, ugly, bad anatomy, bad perspective, pixelated, noise, artifacts, CGI look, plastic, smooth skin, cartoon, illustration, painting, drawing, fused fingers, missing limbs, bad proportions, duplicate, cropped, extra fingers, deformed, lowres, unknown, mutation"

ULTRA_QUALITY_SUFFIX = ", interior architecture photography, Architectural Digest, Dezeen, award-winning, Unreal Engine 5 render, Octane Render, Ray Tracing, Global Illumination, 8k textures, highly detailed, sharp focus, depth of field, 8k, uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT3"

# Initialize Clients
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
if REPLICATE_API_TOKEN:
    os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN # Replicate SDK uses env var

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


async def generate_design(image_url: str, prompt: str, style: str, room_type: str, ai_strength: float = 0.75, lighting_option: str = "Soft"):
    
    # 1. Map Style and Lighting
    style_prompt = STYLE_PROMPTS.get(style, style) # Fallback to raw string if key not found
    
    # Lighting Mapping (Frontend ID -> Backend Key)
    lighting_map = {
        'golden': 'Warm',
        'nordic': 'Natural',
        'blue_hour': 'Dramatic', 
        'studio': 'Cool',      
        'warm_bulb': 'Warm'
    }
    
    modifier_key = lighting_map.get(lighting_option, "Soft")
    selected_lighting = LIGHTING_MODIFIERS.get(modifier_key, LIGHTING_MODIFIERS["Soft"])

    # 2. Construct Final Prompt
    final_prompt = f"Professional photography of a {style_prompt} {room_type}, {prompt}. {selected_lighting}{ULTRA_QUALITY_SUFFIX}"
    print(f"[AI Service] Generated Prompt: {final_prompt}")

    # 3. Call Replicate
    # Model: jagilley/controlnet-hough or similar generic interior model. 
    # Let's use 'jagilley/controlnet-canny:aff48af9c68d162388d230a2ab00a52f9540756738eefe754528f6b5b23307b2' for simplicity/robustness
    # OR 'stability-ai/sdxl' with controlnet. 
    # Let's Stick to the one I saw in code earlier or a safe bet: 'jagilley/controlnet-hough' preserves structure best.
    # Version: 854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b
    
    model_version = "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b" # controlnet-hough
    
    try:
        # Use predictions.create to return immediately (async behavior for frontend polling)
        prediction = replicate.predictions.create(
            version=model_version,
            input={
                "image": image_url,
                "prompt": final_prompt,
                "negative_prompt": BASE_NEGATIVE_PROMPT,
                "num_samples": "1",
                "image_resolution": "512",
                "ddim_steps": 20,
                "scale": 9,
                "eta": 0,
                "a_prompt": "best quality, extremely detailed",
                "n_prompt": BASE_NEGATIVE_PROMPT
            }
        )
        return prediction
    except Exception as e:
        print(f"Replicate Error: {e}")
        raise e

def get_prediction_status(prediction_id: str):
    return replicate.predictions.get(prediction_id)

async def generate_inpainting_job(image_url: str, mask_url: str, prompt: str = "remove object, clean background", width: int = 512, height: int = 512):
    # Model: stability-ai/stable-diffusion-inpainting (Verified Public Version)
    # New Version Hash: c28b92a7ecd66eee4aefcd8a94eb9e7f6c3805d5f06038165407fb5cb355ba67
    model_version = "c28b92a7ecd66eee4aefcd8a94eb9e7f6c3805d5f06038165407fb5cb355ba67"
    
    print(f"[AI Service] Inpainting Request - Model: {model_version[:8]}... Size: {width}x{height}")
    print(f"[AI Service] Image URI Length: {len(image_url)}")
    print(f"[AI Service] Mask URI Length: {len(mask_url)}")

    try:
        prediction = replicate.predictions.create(
            version=model_version,
            input={
                "image": image_url,
                "mask": mask_url,
                "prompt": prompt,
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "width": width,   # Enforce Original Width
                "height": height, # Enforce Original Height
            }
        )
        print(f"[AI Service] Job Started: {prediction.id}")
        return prediction
    except Exception as e:
         print(f"[AI Service] CRITICAL REPLICATE ERROR: {str(e)}")
         raise e

async def chat_with_openai(message: str, history: list = [], context: dict = None):
    # --- OPENAI GPT-4o SUPPORT ---
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        return "System Error: OPENAI_API_KEY not found. Please check .env."

    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)

    try:
        # 1. System Prompt
        system_instruction = (
            "You are 'Designika', an expert Interior Design implementation assistant. "
            "Format your answers using Markdown for clarity. "
            "Use bullet points, bold text for key terms, and numbered lists where appropriate. "
            "Keep answers brief, helpful, and focused on design advice."
        )
        if context:
            style = context.get('style', 'General')
            room = context.get('room', 'Room')
            system_instruction += f"\n User Context: Designing a {style} {room}."

        # 2. History & Messages
        messages_payload = [{"role": "system", "content": system_instruction}]
        
        for msg in history:
            messages_payload.append({"role": msg['role'].replace('model', 'assistant'), "content": msg['content']})

        # 3. Current User Message + Image (Vision)
        user_content = [{"type": "text", "text": message}]
        
        if context and context.get('image'):
            img_input = context['image']
            final_img_url = ""
            if "base64," in img_input:
                 final_img_url = img_input # OpenAI accepts Data URIs
            elif img_input.startswith("http"):
                 final_img_url = img_input
            else:
                 final_img_url = f"data:image/jpeg;base64,{img_input}"

            if final_img_url:
                print("[AI Service] Vision: Attaching image to GPT-4o request.")
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": final_img_url}
                })

        messages_payload.append({"role": "user", "content": user_content})

        # 4. Call GPT-4o
        print("[AI Service] Sending request to GPT-4o...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages_payload,
            max_tokens=600,
            temperature=0.7
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"[AI Service] OpenAI Error: {e}")
        return f"I had trouble thinking about that. Error: {str(e)}"
