<h1 align="center">
  <br>
  🧳 TripMind
  <br>
</h1>

<h4 align="center">AI-powered travel planner that turns your ideas into detailed, day-by-day itineraries — with interactive maps, hidden gems, and smart budget estimates.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-folder-structure">Folder Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Itinerary Generation** | Describe your trip in natural language — Gemini Flash generates a complete day-by-day plan with morning, afternoon, and evening activities |
| 🗺️ **Interactive Map** | Every activity is pinned on a Leaflet map with real GPS coordinates. Visualize your whole trip at a glance |
| 💰 **Smart Budget Estimates** | Get per-day and total estimated costs. Supports multiple currencies |
| 💎 **Hidden Gems** | Discover off-the-beaten-path spots handpicked for your travel style and preferences |
| 🎒 **Packing Tips** | Context-aware packing suggestions generated for your destination, season, and activities |
| 📋 **Trip History** | All your generated itineraries are saved to your account and accessible from a dashboard |
| 🔐 **Secure Auth** | JWT-based authentication with bcrypt password hashing |
| 🎨 **Polished UI** | Smooth animations via Framer Motion, fully responsive Tailwind CSS layout |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 14 (App Router) | React framework, file-based routing, SSR |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety across the entire frontend |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Page transitions and component animations |
| [React Leaflet](https://react-leaflet.js.org/) | 4 | Interactive trip maps with GPS markers |
| [Lucide React](https://lucide.dev/) | latest | Icon library |
| [Axios](https://axios-http.com/) | 1 | HTTP client for API calls |
| [js-cookie](https://github.com/js-cookie/js-cookie) | 3 | JWT token storage in browser cookies |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Express.js](https://expressjs.com/) | 5 | HTTP server and REST API routing |
| [Prisma](https://www.prisma.io/) | 5 | Type-safe ORM for PostgreSQL |
| [PostgreSQL](https://www.postgresql.org/) | — | Relational database for users and trips |
| [Google Gemini](https://ai.google.dev/) | gemini-flash-latest | LLM for structured itinerary generation |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9 | Stateless JWT authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3 | Password hashing |
| [dotenv](https://github.com/motdotla/dotenv) | 17 | Environment variable management |
| [cors](https://github.com/expressjs/cors) | 2 | Cross-origin request handling |

---

## 🏗 Architecture

```
                          ┌─────────────────────────────┐
                          │         User Browser         │
                          │   Next.js 14 (App Router)    │
                          │  TypeScript • Tailwind CSS   │
                          │  Framer Motion • Leaflet     │
                          └──────────────┬───────────────┘
                                         │ HTTPS / REST API
                          ┌──────────────▼───────────────┐
                          │       Express.js Server       │
                          │  ┌──────────────────────────┐│
                          │  │  JWT Auth Middleware      ││
                          │  └──────────────────────────┘│
                          │  ┌─────────┐  ┌────────────┐ │
                          │  │/auth    │  │/trips      │ │
                          │  │ routes  │  │ routes     │ │
                          │  └─────────┘  └────┬───────┘ │
                          │                     │         │
                          │  ┌──────────────────▼───────┐ │
                          │  │    AI Service (Gemini)    │ │
                          │  │  gemini-flash-latest LLM  │ │
                          │  └──────────────────────────┘ │
                          └──────────────┬───────────────┘
                                         │ Prisma ORM
                          ┌──────────────▼───────────────┐
                          │         PostgreSQL             │
                          │  Users table • Trips table    │
                          └──────────────────────────────┘
```

**Data flow for itinerary generation:**
1. Authenticated user submits trip preferences (destination, days, budget, style, pace)
2. Express route calls the AI Service
3. AI Service builds a structured prompt and calls the Gemini API, requesting a strict JSON response
4. The parsed itinerary JSON is stored in the `trips` table via Prisma
5. The full trip record (including GPS coordinates per activity) returns to the frontend
6. React-Leaflet renders markers from the coordinate data; Framer Motion animates the UI

---

## 📁 Folder Structure

```
TripMind/
├── .env.example               # Root env template
├── .gitignore
├── vercel.json                # Vercel deployment config (targets /frontend)
│
├── backend/                   # Express.js REST API
│   ├── server.js              # App entry point — wires up middleware & routes
│   ├── package.json
│   ├── .env                   # Runtime secrets (not committed)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification — protects all /trips routes
│   │
│   ├── routes/
│   │   ├── auth.js            # POST /auth/register, POST /auth/login
│   │   └── trips.js           # POST /trips/generate, GET /trips/my, GET /trips/:id
│   │
│   ├── services/
│   │   └── aiService.js       # Gemini API integration — prompt engineering & JSON parsing
│   │
│   └── prisma/
│       └── schema.prisma      # Database schema — User and Trip models
│
└── frontend/                  # Next.js 14 App Router
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    │
    ├── app/                   # App Router pages
    │   ├── layout.tsx         # Root layout with global font and metadata
    │   ├── page.tsx           # Landing / home page
    │   ├── globals.css
    │   │
    │   ├── auth/
    │   │   ├── login/         # Login page
    │   │   └── register/      # Registration page
    │   │
    │   ├── dashboard/         # User dashboard — trip history
    │   └── plan/              # Trip planner form + generated itinerary view with map
    │
    ├── components/            # Shared UI components
    ├── lib/                   # Utilities (API client, helpers)
    └── types/                 # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** running locally (or a hosted instance)
- **Google Gemini API Key** — get one free at [aistudio.google.com](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/vishalkumar321/TripMind.git
cd TripMind
```

---

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```bash
cp .env.example backend/.env
```

Then fill in your values:

```env
# backend/.env

# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tripmind"

# A long, random secret for signing JWTs
JWT_SECRET="your-super-secret-jwt-key"

# Google AI Studio API key
GEMINI_API_KEY="your-gemini-api-key"

# Server port (optional, defaults to 8000)
PORT=8000
```

> **Tip:** Generate a strong JWT secret with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

### 3. Set Up the Database

Make sure PostgreSQL is running, then run the Prisma migration to create the `users` and `trips` tables:

```bash
cd backend
npm install
npx prisma migrate dev --name init
```

---

### 4. Start the Backend

```bash
# Inside /backend
npm run dev
# Server starts at http://localhost:8000
```

---

### 5. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Register an account, describe your trip, and let TripMind plan it for you.

---

## 📡 API Reference

All `/trips` routes require a `Bearer` token in the `Authorization` header.

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{ name, email, password }` | Create a new account |
| `POST` | `/auth/login` | `{ email, password }` | Login and receive a JWT |

### Trips

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/trips/generate` | `{ destination, description, days, budget, currency, style, pace }` | Generate and save an AI itinerary |
| `GET` | `/trips/my` | — | Fetch all trips for the logged-in user |
| `GET` | `/trips/:id` | — | Fetch a single trip by ID |

#### Example — Generate a Trip

```bash
curl -X POST http://localhost:8000/trips/generate \
  -H "Authorization: Bearer <your_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Kyoto, Japan",
    "description": "I want a mix of temples, street food, and nature walks",
    "days": 5,
    "budget": 1500,
    "currency": "USD",
    "style": "Cultural",
    "pace": "Relaxed"
  }'
```

---

## ☁️ Deployment

TripMind is architected for a zero-cost cloud deployment across three platforms:

### Database → [Supabase](https://supabase.com/)
1. Create a free Supabase project
2. Copy the **Direct Connection** PostgreSQL string from *Project Settings → Database*
3. Set it as `DATABASE_URL` in your backend environment

### Backend API → [Railway](https://railway.app/)
1. Create a new Railway project and connect your GitHub repository
2. Set the **Root Directory** to `backend`
3. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`
4. Deploy — Railway auto-detects Node.js and runs `npm start`

### Frontend → [Vercel](https://vercel.com/)
1. Import the GitHub repository into Vercel
2. Vercel reads `vercel.json` at the root to target the `frontend/` directory automatically
3. Set the environment variable `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Deploy — Vercel handles the Next.js build pipeline

---

## 🗄 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  trips     Trip[]
}

model Trip {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  destination String
  days        Int
  budget      String
  style       String
  itinerary   Json     // Full AI-generated itinerary stored as JSON
  createdAt   DateTime @default(now())
}
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ by <a href="https://github.com/vishalkumar321">Vishal Kumar</a></p>
