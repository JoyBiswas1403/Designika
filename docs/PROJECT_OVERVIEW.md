# Interior Design AI - Project Overview

## 🎯 Vision
AI-powered interior design transformation platform that helps users redesign their living spaces using advanced AI technology.

---

## 📁 Project Structure

```
interior-design-ai/
├── backend/               # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/        # REST API handlers
│   │   ├── services/           # Business logic & AI integrations
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth & validation
│   │   └── index.ts            # Entry point
│   ├── prisma/                 # Database schema (SQLite/Postgres)
│   └── package.json            # Node dependencies
│
├── frontend/                   # React TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   ├── store/              # State management
│   │   ├── lib/                # API client & utilities
│   │   └── App.tsx             # Main app component
│   └── package.json            # Node dependencies
│
├── docs/                       # Project documentation
├── docker-compose.yml          # Docker orchestration
└── README.md                   # Quick start guide
```

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type-safe JavaScript |
| Vite | Build tool & dev server |
| TailwindCSS | Utility-first styling |
| Zustand | Lightweight state management |
| React Router | Client-side routing |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express | Web framework |
| TypeScript | Type safety |
| Prisma | ORM for database |
| SQLite | Development database |
| JSON Web Token | Authentication |

### AI Services
| Service | Purpose |
|---------|---------|
| Replicate (ControlNet) | Structure-preserving redesign |
| Replicate (SDXL) | High-quality image generation |
| Lama Cleaner | Object removal (Inpainting) |
| Google Gemini / OpenAI | Smart interior consultant (Planned) |

---

## 📄 Pages & Features

### 1. Home Page (`/`)
- Hero section with feature highlights
- Quick access to transformation flow
- Design gallery preview

### 2. Transform Page (`/transform`)
- **Image Upload** - Drag & drop room photos
- **Style Selection** - 12+ interior design styles
- **Intensity Control** - Adjust transformation strength
- **Before/After Comparison** - Slider view
- **Download Results** - Save transformed images

### 3. Gallery Page (`/gallery`)
- Curated interior design inspiration
- Filter by room type and style
- High-quality design examples

### 4. History Page (`/history`)
- Saved transformations
- Version comparison
- Re-apply previous styles

### 5. Budget Page (`/budget`)
- Cost estimation for redesigns
- Product recommendations
- Budget planning tools

### 6. Learn Page (`/learn`)
- Interior design education
- Style guides and tips
- Design principles

### 7. Profile Page (`/profile`)
- User preferences
- Design DNA analysis
- Saved styles

### 8. AR Page (`/ar`)
- Augmented reality preview (planned)
- 3D visualization

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Transform
- `POST /api/v1/transform` - Start transformation job
- `GET /api/v1/transform/{job_id}` - Get job status
- `GET /api/v1/transform/styles` - List available styles

### Designs
- `GET /api/v1/designs` - List user designs
- `POST /api/v1/designs` - Save design
- `DELETE /api/v1/designs/{id}` - Delete design

### AI Services
- `GET /api/v1/ai/status` - Check AI service availability
- `POST /api/v1/ai/analyze` - Analyze room image

---

## 🎨 Available Design Styles

1. **Modern Minimalist** - Clean lines, neutral colors
2. **Scandinavian** - Light wood, hygge aesthetic
3. **Industrial** - Exposed brick, metal accents
4. **Mid-Century Modern** - Retro 50s/60s design
5. **Bohemian** - Eclectic, colorful, layered
6. **Contemporary** - Current trends, sophisticated
7. **Traditional** - Classic, elegant furniture
8. **Coastal** - Beach house, blue/white palette
9. **Farmhouse** - Rustic, shiplap, barn doors
10. **Art Deco** - 1920s glamour, geometric
11. **Japanese Zen** - Wabi-sabi, natural materials
12. **Transitional** - Classic meets contemporary

---

## 🔧 Backend Services

| Service | File | Purpose |
|---------|------|---------|
| AI Service | `ai.service.ts` | Replicate integration (Redesign & Inpainting) |
| Auth Controller | `auth.controller.ts` | User registration & login |
| Design Controller | `design.controller.ts` | Design management |
| Inpainting Controller | `inpainting.controller.ts` | Magic Eraser handler |
| Middleware | `auth.middleware.ts` | JWT Verification |
| Uploads | `upload.middleware.ts` | File handling |

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)

### Development

```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install

# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

### Environment Variables
Create `.env` in `backend/`:
```
REPLICATE_API_TOKEN=r8_your_token
JWT_SECRET=your_jwt_secret
DATABASE_URL="file:./dev.db"
```

---

## 📊 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| UI/Frontend | ✅ Complete | All pages functional |
| Backend API | ✅ Complete | All endpoints working |
| Image Upload | ✅ Complete | Drag & drop working |
| Style Selection | ✅ Complete | 12 styles available |
| Before/After View | ✅ Complete | Slider comparison |
| Gallery | ✅ Complete | Sample images |
| AI Transformation | ✅ Complete | Full Replicate ControlNet integration |

> **Note:** We are now using Replicate for production-grade AI transformations.
