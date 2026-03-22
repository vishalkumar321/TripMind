const express = require('express');
const { PrismaClient } = require('@prisma/client');
const protect = require('../middleware/authMiddleware');
const { generateItinerary } = require('../services/aiService');

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

router.post('/generate', async (req, res) => {
    try {
        const tripData = req.body;

        const itinerary = await generateItinerary(tripData);

        const trip = await prisma.trip.create({
            data: {
                userId: req.user.id,
                title: itinerary.title || 'My Amazing Journey',
                destination: tripData.destination || itinerary.title || 'Unknown Destination',
                days: parseInt(tripData.days) || 1,
                budget: `${tripData.currency || ''} ${tripData.budget}`,
                style: tripData.style || 'Mid-range',
                itinerary: itinerary
            }
        });

        res.json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to generate trip' });
    }
});

router.get('/my', async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const trip = await prisma.trip.findUnique({
            where: { id: req.params.id }
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
