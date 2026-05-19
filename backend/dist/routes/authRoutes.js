"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-local-dev';
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                categories: {
                    create: [
                        { name: 'Personal', color: '#10b981' },
                        { name: 'Work', color: '#3b82f6' },
                        { name: 'Study', color: '#8b5cf6' }
                    ]
                }
            },
            include: {
                categories: true
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            // In case we are trying to login with test@example.com which might have no password
            if (email === 'test@example.com' && user.password === "") {
                // Allow for legacy test user fallback if needed, but it's better to force them to register a new one.
                // Actually, let's just let it fail so they know they need a real account, unless they provided empty string.
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        // Fetch user with categories for the frontend
        const userWithCategories = await prisma.user.findUnique({
            where: { id: user.id },
            include: { categories: true }
        });
        res.json({ user: userWithCategories, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get current user (using token)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { categories: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});
// Guest Login
router.post('/guest', async (req, res) => {
    try {
        const guestEmail = 'guest@habittracker.com';
        let user = await prisma.user.findUnique({
            where: { email: guestEmail },
            include: { categories: true }
        });
        if (!user) {
            const hashedPassword = await bcrypt_1.default.hash('guestpassword123', 10);
            user = await prisma.user.create({
                data: {
                    email: guestEmail,
                    password: hashedPassword,
                    name: 'Guest User',
                    categories: {
                        create: [
                            { name: 'Personal', color: '#10b981' },
                            { name: 'Work', color: '#3b82f6' },
                            { name: 'Study', color: '#8b5cf6' }
                        ]
                    }
                },
                include: { categories: true }
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    }
    catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
