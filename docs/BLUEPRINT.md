# 🏗️ Interior Design AI - Project Blueprint

## Vision
A modern, AI-powered platform that democratizes interior design by allowing anyone to visualize professional transformations of their living spaces instantly.

## Architecture Guidelines for AI Agent
This document serves as the "Source of Truth" for the AI agent when maintaining or extending the project.

### Core Principles
1.  **Simplicity First:** The MVP focuses strictly on "Upload -> Transform -> View". No feature creep (e.g., no social feed, budget planners, or AR until MVP is stable).
2.  **Privacy:** User photos are processed securely. Designs are private by default.
3.  **Visual Excellence:** The UI must be premium, responsive, and polished.

### System Architecture

#### Frontend (`/frontend`)
- **Framework:** React 18 + Vite
- **State Management:** Zustand (Auth, Theme, Transform State)
- **Styling:** Tailwind CSS + Lucide Icons
- **Key Components:**
  - `TransformPage`: The core interaction loop. Handles image upload, style selection, and polling for results.
  - `VariationGallery`: Displays transformation results.
  - `AppShell`: Main layout and navigation.

#### Backend (`/backend`)
- **Framework:** Node.js + Express + TypeScript
- **AI Engine:** Replicate API (ControlNet + SDXL)
- **Database:** SQLite (Dev) / PostgreSQL (Prod) via Prisma ORM
- **Storage:** Local `uploads/` for dev, S3 compatible for prod.

### Data Flow
1.  **Upload:** User uploads image -> Frontend sends to Backend -> Backend saves to `uploads/` -> Returns URL/Path.
2.  **Transform:** Frontend selects Style -> Backend sends Image + Prompt to Replicate API.
3.  **Processing:** Replicate processes (async) -> Backend polls/receives webhook.
4.  **Result:** Backend downloads result -> Saves to local storage -> Returns result to Frontend.

### Integration Points
- **Replicate:** Primary AI provider.
  - Model: `adirik/interior-design` (or similar ControlNet enabled model).
  - Auth: `REPLICATE_API_TOKEN`.

## Future Roadmap (Post-MVP)
- **Phase 2:** User Accounts & Cloud Storage. (Completed)
- **Phase 3:** Magic Eraser / In-painting. (Completed)
- **Phase 4:** Smart Interior Consultant (Chat). (Planned)
- **Phase 5:** Mobile App (React Native).
