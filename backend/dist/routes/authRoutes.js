"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-local-dev';
const setCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};
const excludePassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name: name?.trim(),
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
        setCookie(res, token);
        res.status(201).json({ user: excludePassword(user), token });
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
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { categories: true }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Support empty password legacy users if needed
        if (user.password === "" && password !== "") {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (user.password !== "") {
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        setCookie(res, token);
        res.json({ user: excludePassword(user), token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});
// Get current user (using token from cookie or header)
router.get('/me', async (req, res) => {
    try {
        let token = req.cookies?.token;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { categories: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: excludePassword(user) });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});
exports.default = router;
