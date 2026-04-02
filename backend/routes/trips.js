const express = require('express');
const { PrismaClient } = require('@prisma/client');
const protect = require('../middleware/authMiddleware');
const { generateItinerary, chatWithTrip } = require('../services/aiService');

const router = express.Router();
const prisma = new PrismaClient();

// ── PUBLIC ROUTES (no auth) ────────────────────────────────────────────────

// Public: fetch a single trip for share page (no auth required)
router.get('/public/:id', async (req, res) => {
    try {
        const trip = await prisma.trip.findUnique({
            where: { id: req.params.id },
            select: {
                id: true, title: true, destination: true,
                days: true, budget: true, style: true,
                createdAt: true, itinerary: true,
                // never expose userId or deletedAt in public view
            }
        });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        res.json(trip);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── PROTECTED ROUTES ───────────────────────────────────────────────────────

router.use(protect);

// Generate a new trip itinerary
router.post('/generate', async (req, res) => {
    const { description, days, budget, currency, style, pace, destination } = req.body;

    // Input validation
    if (!description || String(description).trim().length < 2) {
        return res.status(400).json({ error: 'Please describe your trip (at least 2 characters).' });
    }
    const numDays = parseInt(days);
    if (!numDays || numDays < 1 || numDays > 30) {
        return res.status(400).json({ error: 'Days must be between 1 and 30.' });
    }
    const numBudget = parseFloat(budget);
    if (!budget || isNaN(numBudget) || numBudget <= 0) {
        return res.status(400).json({ error: 'Please enter a valid positive budget.' });
    }

    try {
        const itinerary = await generateItinerary({ description, days: numDays, budget, currency, style, pace, destination });

        const trip = await prisma.trip.create({
            data: {
                userId: req.user.id,
                title: itinerary.title || 'My Amazing Journey',
                destination: destination || itinerary.title || 'Unknown Destination',
                days: numDays,
                budget: `${currency || ''} ${budget}`.trim(),
                style: style || 'Mid-range',
                itinerary,
            }
        });

        res.json(trip);
    } catch (err) {
        if (err.message === 'AI_RATE_LIMIT') {
            return res.status(429).json({ error: 'AI is currently busy (Rate Limit). Please try again in 1 minute.' });
        }
        
        const isDatabaseError = err.message?.includes('Prisma') || err.message?.includes('database') || err.code?.startsWith('P');
        const isGeminiError = err.message?.includes('AI') || err.message?.includes('itinerary') || err.message?.includes('malformed');

        const clientMsg = isDatabaseError
            ? 'Database error. Please check your connection.'
            : isGeminiError
                ? 'AI is taking too long. Please try again.'
                : 'Something went wrong. Please check your internet.';
                
        res.status(500).json({ error: clientMsg });
    }
});

// AI Chat — context-aware assistant for a trip
router.post('/chat', async (req, res) => {
    try {
        const { message, tripContext } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const reply = await chatWithTrip(message, tripContext || null);
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
});

// Fetch all trips for the authenticated user (exclude soft-deleted)
router.get('/my', async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.user.id, deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Soft delete a trip
router.delete('/:id', async (req, res) => {
    try {
        const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
        if (!trip || trip.deletedAt) return res.status(404).json({ error: 'Trip not found' });
        if (trip.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        await prisma.trip.update({
            where: { id: req.params.id },
            data: { deletedAt: new Date() }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Fetch a single trip (protected, ownership check)
router.get('/:id', async (req, res) => {
    try {
        const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
        if (!trip || trip.deletedAt) return res.status(404).json({ error: 'Trip not found' });
        if (trip.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        res.json(trip);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
