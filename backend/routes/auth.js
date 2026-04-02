const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Server-side email validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

router.post('/signup', async (req, res) => {
    try {
        const name = (req.body.name || '').trim();
        const email = (req.body.email || '').trim().toLowerCase();
        const password = (req.body.password || '').trim();

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Google OAuth upsert — called by NextAuth after Google sign-in
router.post('/google', async (req, res) => {
    try {
        const { name, email, image } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { name: name || email.split('@')[0], email, image: image || null }
            });
        } else if (image && !user.image) {
            user = await prisma.user.update({ where: { email }, data: { image } });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const password = (req.body.password || '').trim();

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Google-only accounts have no password
        if (!user.password) {
            return res.status(401).json({ error: 'This account uses Google Sign-In. Please click "Continue with Google".' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // exclude password
        const { password: _, ...userWithoutPassword } = user;

        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
