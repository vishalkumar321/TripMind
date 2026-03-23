<h1 align="center">
  <br>
  🧳 TripMind
  <br>
</h1>

<h4 align="center">AI-powered travel planner — describe your trip in plain English and get a complete day-by-day itinerary with interactive maps, live weather, budget tracking, and more.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e" />
</p>

<p align="center">
  <a href="https://trip-mind-h02kper4i-vishalkumar321s-projects.vercel.app" target="_blank"><strong>🚀 Live Demo »</strong></a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://tripmind-uvwj.onrender.com/health" target="_blank"><strong>🔌 API Health »</strong></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Local Setup</a> •
  <a href="#️-deployment">Deployment</a> •
  <a href="#-api-reference">API Docs</a> •
  <a href="#-database-schema">Schema</a>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Itinerary Generation** | Describe your trip in plain English — Gemini 2.0 Flash generates a full day-by-day plan with morning / afternoon / evening activities, real GPS coordinates, hidden gems, and packing tips |
| 🗺️ **Interactive Map** | Every activity pinned on a Leaflet map — visualise your entire route at a glance |
| ☀️ **Live Weather** | Per-day weather forecast fetched from [Open-Meteo](https://open-meteo.com/) for your exact destination |
| 💰 **Budget Tracker** | Per-day cost estimates, total budget summary, and an expense log with PDF export |
| 💎 **Hidden Gems** | Off-the-beaten-path recommendations tailored to your travel style |
| 🎒 **Packing Checklist** | Context-aware packing list — persisted locally as you tick items off |
| 🤝 **AI Trip Chat** | Ask follow-up questions about your itinerary using a context-aware AI assistant |
| 🔗 **Trip Sharing** | One-click public share link for any itinerary — no account required to view |
| 🔐 **Secure Auth** | JWT + bcrypt credentials, Google OAuth via NextAuth.js |
| 📱 **Fully Responsive** | Mobile-first layout, hamburger sidebar, optimised tap targets |
| ✨ **Smooth UX** | Page transitions via Framer Motion, toast notifications, loading skeletons |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 14 | React framework, App Router, SSR |
| [TypeScript](https://www.typescriptlang.org/) | 5 | End-to-end type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Page transitions & micro-animations |
| [React Leaflet](https://react-leaflet.js.org/) | 4 | Interactive GPS maps |
| [NextAuth.js](https://next-auth.js.org/) | 4 | Google OAuth + credentials sessions |
| [Recharts](https://recharts.org/) | 3 | Budget & expense charts |
| [Axios](https://axios-http.com/) | 1 | HTTP client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Express.js](https://expressjs.com/) | 5 | REST API server |
| [Prisma](https://www.prisma.io/) | 5 | Type-safe ORM |
| [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) | — | Relational database with connection pooling |
| [Google Gemini 2.0 Flash](https://ai.google.dev/) | — | Structured AI itinerary generation |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9 | Stateless JWT authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3 | Password hashing |
| [dotenv](https://github.com/motdotla/dotenv) | 16 | Environment variable management |

### Infrastructure
| Layer | Platform |
|---|---|
| **Frontend** | [Vercel](https://vercel.com/) |
| **Backend API** | [Render](https://render.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL + pgBouncer) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│              Browser (Next.js 14)                │
│   App Router · NextAuth · Framer Motion          │
│   React Leaflet · Recharts · Tailwind CSS        │
└───────────────────┬─────────────────────────────┘
                    │  HTTPS / REST (JSON)
                    ▼
┌─────────────────────────────────────────────────┐
│           Express.js 5 API (Render)             │
│                                                  │
│  POST /auth/signup   POST /auth/login            │
│  POST /auth/google   GET  /auth/me               │
│                                                  │
│  POST /trips/generate  ──►  Gemini 2.0 Flash    │
│  GET  /trips/my                                  │
│  GET  /trips/:id                                 │
│  GET  /trips/public/:id                          │
│  POST /trips/chat      ──►  Gemini 2.0 Flash    │
│  DELETE /trips/:id                               │
│                                                  │
│  JWT Middleware · CORS · Error Handling          │
└───────────────────┬─────────────────────────────┘
                    │  Prisma ORM
                    ▼
┌─────────────────────────────────────────────────┐
│     PostgreSQL via Supabase (pgBouncer pool)     │
│     Users · Trips (JSON itinerary, soft delete)  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- A free [Supabase](https://supabase.com/) project (PostgreSQL)
- A [Google Gemini API key](https://aistudio.google.com/)
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)

---

### 1 · Clone the repo

```bash
git clone https://github.com/vishalkumar321/TripMind.git
cd TripMind
```

---

### 2 · Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Database (from Supabase → Settings → Database → Connection Pooling)
DATABASE_URL="postgresql://USER:PASS@host:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASS@host:5432/postgres"

# Auth
JWT_SECRET="run: openssl rand -hex 32"

# AI
GEMINI_API_KEY="your-key-from-aistudio.google.com"

# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Push the schema and start the server:

```bash
npm run dev
# Runs: npx prisma generate && npx prisma db push && nodemon server.js
```

Backend runs at `http://localhost:8000`

---

### 3 · Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=same-value-as-JWT_SECRET
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Start the dev server:

```bash
npm run dev
# App runs at http://localhost:3000
```

---

## ☁️ Deployment

### Database — Supabase
1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to **Settings → Database → Connection Pooling**
3. Copy the **Connection string (Transaction mode, port 6543)** → `DATABASE_URL`
4. Copy the **Direct connection string (port 5432)** → `DIRECT_URL`

---

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com/)
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

4. Add environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Supabase pooled connection string |
| `DIRECT_URL` | Your Supabase direct connection string |
| `JWT_SECRET` | Strong random secret (`openssl rand -hex 32`) |
| `GEMINI_API_KEY` | Your Google AI Studio key |
| `PORT` | `8000` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your Vercel frontend URL |

5. Verify the deployment:
```bash
curl https://your-backend.onrender.com/health
# → { "status": "ok", "timestamp": "..." }
```

---

### Frontend — Vercel

1. Create a new project on [vercel.com](https://vercel.com/)
2. Import your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | `Next.js` |
| Build Command | *(leave empty — auto-detected)* |
| Output Directory | *(leave empty — auto-detected)* |

4. Add environment variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL |
| `NEXTAUTH_URL` | Your Vercel frontend URL |
| `NEXTAUTH_SECRET` | Same value as backend `JWT_SECRET` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |

5. Add your Vercel URL to **Google Cloud Console → OAuth Client → Authorized redirect URIs**:
```
https://your-app.vercel.app/api/auth/callback/google
```

---

## 📡 API Reference

Base URL: `https://tripmind-uvwj.onrender.com`

All `/trips` routes (except `/trips/public/:id`) require:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | `{ name, email, password }` | Register a new user |
| `POST` | `/auth/login` | `{ email, password }` | Login, returns JWT token |
| `POST` | `/auth/google` | `{ name, email, image }` | Google OAuth upsert |
| `GET` | `/auth/me` | — | Get current user profile |

### Trips

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/trips/generate` | `{ description, days, budget, currency, style, pace, destination }` | Generate & save AI itinerary |
| `GET` | `/trips/my` | — | All trips for current user |
| `GET` | `/trips/:id` | — | Single trip (owner only) |
| `GET` | `/trips/public/:id` | — | Public share view (no auth) |
| `POST` | `/trips/chat` | `{ message, tripContext }` | AI assistant chat |
| `DELETE` | `/trips/:id` | — | Soft-delete a trip |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "ok", timestamp }` |

#### Example — Generate a trip
```bash
curl -X POST https://tripmind-uvwj.onrender.com/trips/generate \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "beach trip with friends, love snorkelling",
    "destination": "Goa, India",
    "days": 4,
    "budget": 15000,
    "currency": "INR",
    "style": "Mid-range",
    "pace": "Relaxed"
  }'
```

---

## 🗄 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String?           // null for Google OAuth users
  image     String?
  createdAt DateTime @default(now())
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
  itinerary   Json              // full AI-generated itinerary object
  createdAt   DateTime  @default(now())
  deletedAt   DateTime?         // soft delete — null means active
  user        User      @relation(fields: [userId], references: [id])
  @@index([userId])
}
```

---

## 📁 Project Structure

```
TripMind/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verify
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── routes/
│   │   ├── auth.js               # Signup, login, Google, me
│   │   └── trips.js              # Generate, list, share, chat, delete
│   ├── services/
│   │   └── aiService.js          # Gemini 2.0 Flash integration
│   └── server.js                 # Express app entry point
│
└── frontend/
    ├── app/
    │   ├── api/auth/[...nextauth]/ # NextAuth handler
    │   ├── auth/                   # Login & signup pages
    │   ├── dashboard/              # Main dashboard page
    │   ├── plan/                   # Trip planning form
    │   └── trip/share/[tripId]/    # Public share view
    ├── components/                 # Reusable UI components
    ├── lib/
    │   └── nextauth-options.ts     # NextAuth config
    └── types/                      # TypeScript type definitions
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase pooled connection (pgBouncer, port 6543) |
| `DIRECT_URL` | ✅ | Supabase direct connection (port 5432, for migrations) |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `PORT` | ✅ | Server port (use `8000` locally, `$PORT` on Render) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `FRONTEND_URL` | ✅ | Frontend origin for CORS whitelist |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXTAUTH_URL` | ✅ | Canonical URL of this Next.js app |
| `NEXTAUTH_SECRET` | ✅ | NextAuth encryption secret |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth 2.0 client secret |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built by <a href="https://github.com/vishalkumar321">Vishal Kumar</a></p>
