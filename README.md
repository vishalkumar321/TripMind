<h1 align="center">
  <br>
  🧳 TripMind
  <br>
</h1>

<h4 align="center">AI-powered travel planner — describe your trip and get a detailed day-by-day itinerary with maps, hidden gems, weather, and budget estimates.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed-Vercel%20%2B%20Railway-000000?logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e" />
</p>

<p align="center">
  <a href="YOUR_VERCEL_URL" target="_blank"><strong>🚀 Live Demo »</strong></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Stack</a> •
  <a href="#-getting-started">Setup</a> •
  <a href="#%EF%B8%8F-deployment">Deploy</a> •
  <a href="#-api-reference">API</a>
</p>

---

> **Screenshot** — *(add a screenshot at `docs/screenshot.png` and uncomment the line below)*
> <!-- ![TripMind Dashboard](docs/screenshot.png) -->

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Itinerary Generation** | Describe your trip in plain language — Gemini 2.0 Flash generates a complete day-by-day plan with morning/afternoon/evening activities and real GPS coordinates |
| 🗺️ **Interactive Map** | Every activity pinned on a Leaflet map — visualise your entire route at a glance |
| ☀️ **Live Weather** | Per-day weather forecast fetched from Open-Meteo for your destination |
| 💰 **Budget Tracker** | Per-day estimated costs, total budget, and an expense log with PDF export |
| 💎 **Hidden Gems** | Off-the-beaten-path recommendations generated for your travel style |
| 🎒 **Packing Checklist** | Context-aware packing list — saved to localStorage as you tick items off |
| 🤝 **AI Trip Chat** | Ask follow-up questions about your itinerary using a contextual AI assistant |
| 🔗 **Trip Sharing** | One-click shareable public link for any itinerary |
| 🔐 **Secure Auth** | JWT + bcrypt credentials, Google OAuth via NextAuth |
| 📱 **Fully Responsive** | Mobile-first layout, hamburger sidebar, 44px tap targets |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework, SSR, file-based routing |
| TypeScript 5 | End-to-end type safety |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion 12 | Page transitions and micro-animations |
| React Leaflet 4 | Interactive GPS maps |
| NextAuth.js | Google OAuth + credentials session management |
| Axios | HTTP client with cancel-token support |

### Backend
| Technology | Purpose |
|---|---|
| Express.js 5 | REST API |
| Prisma 5 | Type-safe ORM |
| PostgreSQL (Supabase) | Relational database |
| Google Gemini 2.0 Flash | Structured itinerary generation |
| jsonwebtoken + bcryptjs | Stateless auth |

---

## 🏗 Architecture

```
Browser (Next.js 14)
      │  HTTPS / REST
      ▼
Express.js API  ──► JWT Middleware
      │
      ├── /auth   routes  (signup · login · Google OAuth upsert)
      └── /trips  routes  (generate · my · share · chat · delete)
                   │
                   ▼
           Gemini 2.0 Flash  ──► JSON itinerary
                   │
                   ▼
      Prisma ORM ──► PostgreSQL (Supabase)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- A free [Supabase](https://supabase.com/) project (PostgreSQL)
- A free [Google Gemini API key](https://aistudio.google.com/)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)

---

### 1 · Clone

```bash
git clone https://github.com/vishalkumar321/TripMind.git
cd TripMind
```

### 2 · Backend env

```bash
cp .env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASS@host:5432/postgres"
JWT_SECRET="run: openssl rand -hex 32"
GEMINI_API_KEY="your-key-from-aistudio"
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3 · Frontend env

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=same-value-as-JWT_SECRET
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4 · Install & run

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev          # runs prisma db push then nodemon

# Terminal 2 — frontend
cd frontend
npm install
npm run dev          # http://localhost:3000
```

---

## ☁️ Deployment

| Layer | Platform | Notes |
|---|---|---|
| **Database** | [Supabase](https://supabase.com/) | Free tier — copy Direct Connection string |
| **Backend API** | [Railway](https://railway.app/) | Set root dir to `backend/`; add env vars; `npm start` auto-runs `prisma db push` |
| **Frontend** | [Vercel](https://vercel.com/) | `vercel.json` targets `frontend/`; set `NEXT_PUBLIC_API_URL` to Railway URL |

**After deploying**, verify the backend is healthy:
```bash
curl https://your-railway-app.railway.app/health
# → { "status": "ok", "timestamp": "..." }
```

---

## 📡 API Reference

All `/trips` routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Body |
|---|---|---|
| `POST` | `/auth/signup` | `{ name, email, password }` |
| `POST` | `/auth/login` | `{ email, password }` |
| `POST` | `/auth/google` | `{ name, email, image }` |
| `GET`  | `/auth/me` | — (token required) |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/trips/generate` | Generate + save AI itinerary |
| `GET`  | `/trips/my` | All trips for current user |
| `GET`  | `/trips/:id` | Single trip (owner only) |
| `GET`  | `/trips/public/:id` | Public share view |
| `POST` | `/trips/chat` | AI chat about a trip |
| `DELETE` | `/trips/:id` | Soft-delete a trip |
| `GET`  | `/health` | Health check |

---

## 🗄 Database Schema

```prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String?
  image     String?
  createdAt DateTime  @default(now())
  trips     Trip[]
  @@index([email])
}

model Trip {
  id          String    @id @default(cuid())
  userId      String
  title       String
  destination String
  days        Int
  budget      String
  style       String
  itinerary   Json
  createdAt   DateTime  @default(now())
  deletedAt   DateTime?
  @@index([userId])
}
```

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built by <a href="https://github.com/vishalkumar321">Vishal Kumar</a></p>
