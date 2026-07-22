"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get reflections for a user within a date range
router.get('/user/:userId', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const whereClause = { userId };
        if (startDate && endDate) {
            whereClause.date = {
                gte: startDate,
                lte: endDate
            };
        }
        const reflections = await prisma.dailyReflection.findMany({
            where: whereClause,
            include: { goal: true, habit: true },
            orderBy: { date: 'desc' }
        });
        res.json(reflections);
    }
    catch (error) {
        console.error('Error fetching reflections:', error);
        res.status(500).json({ error: 'Server error fetching reflections' });
    }
});
// Get reflection for a specific date
router.get('/user/:userId/date/:date', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    try {
        const { userId, date } = req.params;
        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const reflection = await prisma.dailyReflection.findUnique({
            where: {
                userId_date: {
                    userId,
                    date
                }
            },
            include: { goal: true, habit: true }
        });
        if (!reflection) {
            return res.status(404).json({ message: 'Reflection not found' });
        }
        res.json(reflection);
    }
    catch (error) {
        console.error('Error fetching reflection for date:', error);
        res.status(500).json({ error: 'Server error fetching reflection' });
    }
});
// Create or Update (Upsert) a daily reflection
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { date, note, focusRating, energyRating, satisfactionRating, q1Progress, q2Learned, q3Blocked, q4NextAction, q5ObstaclePlan, goalId, habitId, userId } = req.body;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const reflection = await prisma.dailyReflection.upsert({
            where: {
                userId_date: {
                    userId,
                    date
                }
            },
            update: {
                note, focusRating, energyRating, satisfactionRating,
                q1Progress, q2Learned, q3Blocked, q4NextAction, q5ObstaclePlan,
                goalId: goalId || null,
                habitId: habitId || null
            },
            create: {
                date, note, focusRating, energyRating, satisfactionRating,
                q1Progress, q2Learned, q3Blocked, q4NextAction, q5ObstaclePlan,
                goalId: goalId || null,
                habitId: habitId || null,
                userId
            }
        });
        res.json(reflection);
    }
    catch (error) {
        console.error('Error saving reflection:', error);
        res.status(500).json({ error: 'Server error saving reflection' });
    }
});
exports.default = router;
