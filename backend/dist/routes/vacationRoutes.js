"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', async (req, res) => {
    const { startDate, endDate, appliesTo, userId } = req.body;
    try {
        const vacation = await prisma.vacation.create({
            data: { startDate, endDate, appliesTo: appliesTo || 'All', userId }
        });
        res.json(vacation);
    }
    catch (error) {
        console.error('Error creating vacation:', error);
        res.status(500).json({ error: 'Failed to create vacation' });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const vacations = await prisma.vacation.findMany({
            where: { userId: req.params.userId }
        });
        res.json(vacations);
    }
    catch (error) {
        console.error('Error fetching vacations:', error);
        res.status(500).json({ error: 'Failed to fetch vacations' });
    }
});
exports.default = router;
