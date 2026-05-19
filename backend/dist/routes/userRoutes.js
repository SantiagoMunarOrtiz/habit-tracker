"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Create or login user
router.post('/', async (req, res) => {
    const { email, name } = req.body;
    try {
        let user = await prisma.user.findUnique({
            where: { email },
            include: { categories: true }
        });
        if (!user) {
            const newUser = await prisma.user.create({ data: { email, name } });
            // Create default categories for the new user
            await prisma.category.createMany({
                data: [
                    { name: 'Personal', color: '#3b82f6', userId: newUser.id },
                    { name: 'Work', color: '#ef4444', userId: newUser.id },
                    { name: 'Study', color: '#10b981', userId: newUser.id },
                ],
            });
            user = await prisma.user.findUnique({
                where: { id: newUser.id },
                include: { categories: true }
            });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
router.get('/:email', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.params.email },
            include: { categories: true },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
exports.default = router;
