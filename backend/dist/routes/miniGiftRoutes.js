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
        const gifts = await prisma.reward.findMany({ where: { userId } });
        res.json(gifts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch mini gifts' });
    }
});
router.post('/', async (req, res) => {
    const userId = req.user?.userId;
    const { name, targetLevel } = req.body;
    if (!userId)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const gift = await prisma.reward.create({
            data: { name, type: 'UserConfigured', requiredCompletions: targetLevel, userId }
        });
        res.json(gift);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create mini gift' });
    }
});
exports.default = router;
