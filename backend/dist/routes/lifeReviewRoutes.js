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
// Get all reviews for a user
router.get('/user/:userId', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    try {
        const { userId } = req.params;
        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const reviews = await prisma.lifeReview.findMany({
            where: { userId },
            include: { areas: true },
            orderBy: [{ year: 'desc' }, { cycle: 'desc' }]
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('Error fetching life reviews:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get a specific review by type, year, cycle
router.get('/user/:userId/cycle', authMiddleware_1.authenticateToken, async (req, res) => {
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    if (req.user?.userId !== req.params.userId)
        return res.status(403).json({ error: 'Forbidden' });
    try {
        const { userId } = req.params;
        const { type, year, cycle } = req.query;
        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const review = await prisma.lifeReview.findUnique({
            where: {
                userId_type_year_cycle: {
                    userId,
                    type: String(type),
                    year: Number(year),
                    cycle: Number(cycle)
                }
            },
            include: { areas: true }
        });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json(review);
    }
    catch (error) {
        console.error('Error fetching life review:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Upsert a review draft
router.post('/', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { userId, type, year, cycle, status, overallSatisfaction, responses, mainPriority, threeChanges, nextAction, actionTargetDate, actionStatus, notes, areas } = req.body;
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // We use a transaction to safely handle the review and its nested areas
        const review = await prisma.$transaction(async (tx) => {
            const existingReview = await tx.lifeReview.findUnique({
                where: { userId_type_year_cycle: { userId, type, year, cycle } }
            });
            // Prevent overwriting a completed review with a draft
            if (existingReview && existingReview.status === 'completed' && status !== 'completed') {
                throw new Error('Cannot overwrite a completed review');
            }
            const upsertedReview = await tx.lifeReview.upsert({
                where: { userId_type_year_cycle: { userId, type, year, cycle } },
                update: {
                    status,
                    overallSatisfaction,
                    responses: responses ? JSON.stringify(responses) : null,
                    mainPriority,
                    threeChanges: threeChanges ? JSON.stringify(threeChanges) : null,
                    nextAction,
                    actionTargetDate,
                    actionStatus: actionStatus || 'not_started',
                    notes,
                    completedAt: status === 'completed' && (!existingReview || existingReview.status !== 'completed') ? new Date() : undefined
                },
                create: {
                    userId, type, year, cycle, status,
                    overallSatisfaction,
                    responses: responses ? JSON.stringify(responses) : null,
                    mainPriority,
                    threeChanges: threeChanges ? JSON.stringify(threeChanges) : null,
                    nextAction,
                    actionTargetDate,
                    actionStatus: actionStatus || 'not_started',
                    notes,
                    completedAt: status === 'completed' ? new Date() : null
                }
            });
            // Upsert areas
            if (areas && Array.isArray(areas)) {
                for (const area of areas) {
                    const existingArea = await tx.lifeReviewArea.findFirst({
                        where: { lifeReviewId: upsertedReview.id, areaName: area.areaName }
                    });
                    if (existingArea) {
                        await tx.lifeReviewArea.update({
                            where: { id: existingArea.id },
                            data: {
                                rating: area.rating,
                                responses: area.responses ? JSON.stringify(area.responses) : null
                            }
                        });
                    }
                    else {
                        await tx.lifeReviewArea.create({
                            data: {
                                lifeReviewId: upsertedReview.id,
                                areaName: area.areaName,
                                rating: area.rating,
                                responses: area.responses ? JSON.stringify(area.responses) : null
                            }
                        });
                    }
                }
            }
            return upsertedReview;
        });
        // Fetch the fully updated review with areas
        const fullReview = await prisma.lifeReview.findUnique({
            where: { id: review.id },
            include: { areas: true }
        });
        res.json(fullReview);
    }
    catch (error) {
        console.error('Error saving life review:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});
// Update final action status
router.patch('/:id/action', authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { actionStatus, notes } = req.body;
        const review = await prisma.lifeReview.findUnique({ where: { id } });
        if (review?.userId !== req.user?.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const updated = await prisma.lifeReview.update({
            where: { id },
            data: { actionStatus, notes: notes !== undefined ? notes : (review?.notes || null) }
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating review action:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
