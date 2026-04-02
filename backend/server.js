const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ── Startup env validation ──────────────────────────────────────────────────
const required = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY'];
required.forEach((key) => {
    if (!process.env[key]) {
        console.error(`Missing required env var: ${key}`);
        process.exit(1);
    }
});

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://trip-mind-neon.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const host = new URL(origin).hostname;
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        if (isLocal || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// ── Request Logger (Development) ──────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
        });
        next();
    });
}

app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'TripMind API running' });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on port ${PORT}`);
    }
});
