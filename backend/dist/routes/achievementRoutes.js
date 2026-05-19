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
router.get('/', async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const achievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true }
        });
        res.json(achievements);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});
router.post('/:id/claim', async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const updated = await prisma.userAchievement.updateMany({
            where: { id: req.params.id, userId },
            data: {} // status: 'Claimed'
        });
        res.json({ success: true, updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to claim achievement' });
    }
});
exports.default = router;
