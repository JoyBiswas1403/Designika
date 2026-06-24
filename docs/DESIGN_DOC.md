# 📐 Technical Design Document

## 1. System Architecture
The system follows a modern **Microservices-ready** architecture, decoupled into a React Frontend and a FastAPI Python Backend.

### **Tech Stack**
*   **Frontend:** React (Vite), TypeScript, TailwindCSS, Framer Motion.
*   **Backend:** Python 3.10+, FastAPI, Uvicorn.
*   **Database:** SQLite (Dev), PostgreSQL (Production).
*   **AI Engines:**
    *   **Vision & Chat:** OpenAI GPT-4o Multi-modal Model.
    *   **Image Generation:** Replicate (Stable Diffusion XL + ControlNet).
*   **Storage:** Local Filesystem (Dev), AWS S3 (Production).

## 2. Transformation Pipeline (`ai_service.py`)

### **Flow**
1.  **Input:** User uploads an image + selects a style (keys: `Minimalist`, `Scandi`, etc.).
2.  **Preprocessing:**
    *   Backend receives `UploadFile`.
    *   Images are resized to nearest multiple of 64 (max 1024px) for ML compatibility.
    *   Converted to Base64/Data URI.
3.  **Prompt Engineering:**
    *   System maps "Style IDs" to rich descriptive prompts (e.g., "ultra-modern minimalist interior, clean lines...").
    *   Adds lighting modifiers (Warm, Cool, Natural) and negative prompts.
4.  **AI Execution (Replicate):**
    *   **ControlNet:** Uses `jagilley/controlnet-hough` (or Canny) to preserve room geometry while changing textures.
    *   **Magic Eraser:** Uses `stability-ai/stable-diffusion-inpainting` for object removal.
5.  **Output:** Returns a URL to the generated image.

## 3. Intelligent Chat System (The "Design Brain")

### **Direct Integration Architecture**
The outdated complex routing (Groq/Gemini) has been replaced with a streamlined, direct integration with **OpenAI GPT-4o**.

1.  **Context Assembly:**
    *   Frontend sends: `User Message` + `Conversation History` + `Current Image (Base64)`.
    *   System injects: `System Prompt` ("You are Designika, an expert consultant...").
2.  **Multimodal Analysis:**
    *   GPT-4o analyzes the image to understand spatial layout, lighting, and clutter.
    *   It cross-references this with the user's text query.
3.  **Markdown Response:**
    *   The model generates a structured Markdown response (Bullet points, Bold headers for key material choices).
    *   This is rendered by the Frontend `ReactMarkdown` engine.

## 4. API Endpoints

### **Transformation**
*   `POST /api/v1/transform/design`: Upload an image to Restyle it.
*   `POST /api/v1/transform/inpainting`: Upload an image + mask to Remove Objects.
*   `GET /api/v1/transform/{id}`: Poll for status.

### **Chat**
*   `POST /api/v1/chat`: Send a message history + image context.

### **Auth & User**
*   `POST /auth/register`: Create account.
*   `POST /auth/login`: Get JWT Token.
*   `GET /users/me`: Get Profile.

## 5. Security
*   **JWT Authentication:** All protected routes require a valid Bearer token.
*   **Password Hashing:** Bcrypt used for secure storage.
*   **Environment Variables:** API Keys (`OPENAI_API_KEY`, `REPLICATE_API_TOKEN`) are strictly server-side.
