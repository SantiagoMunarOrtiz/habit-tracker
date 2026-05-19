"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', async (req, res) => {
    const userId = req.user?.userId;
    const { level, confirmation } = req.body;
    if (!userId)
        return res.status(401).json({ error: 'Unauthorized' });
    if (level === 'full' && confirmation !== 'RESET') {
        return res.status(400).json({ error: 'Invalid confirmation' });
    }
    try {
        if (level === 'points' || level === 'full') {
            await prisma.user.update({ where: { id: userId }, data: { points: 0 } });
        }
        if (level === 'achievements' || level === 'full') {
            await prisma.userAchievement.deleteMany({ where: { userId } });
        }
        if (level === 'progress' || level === 'full') {
            await prisma.habitLog.deleteMany({ where: { habit: { userId } } });
        }
        if (level === 'rewards' || level === 'full') {
            // Assuming rewards logic if any
        }
        await prisma.habitLog.create({
            data: { userId, resetType: level, resetScope: level, previousPoints: 0 }
        });
        res.json({ success: true, message: `Reset ${level} completed.` });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reset' });
    }
});
exports.default = router;
