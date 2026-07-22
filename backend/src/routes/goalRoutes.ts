import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get all goals for a user
router.get('/user/:userId', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    try {
        const { userId } = req.params;

        // Ensure the authenticated user is requesting their own goals
        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const goals = await prisma.goal.findMany({
            where: { userId },
            include: {
                rules: true,
                habits: {
                    include: { logs: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Server error fetching goals' });
    }
});

// Create a new goal with rules
router.post('/', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const { title, term, targetDate, userId, rules } = req.body;
  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });


        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const goal = await prisma.goal.create({
            data: {
                title,
                term: term || 'short',
                targetDate: targetDate ? new Date(targetDate) : null,
                userId,
                rules: {
                    create: rules?.map((r: { text: string }) => ({ text: r.text })) || []
                }
            },
            include: { rules: true }
        });

        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Server error creating goal' });
    }
});

// Update a goal (e.g. mark as completed)
router.patch('/:id', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, title, term } = req.body;

        const goal = await prisma.goal.findUnique({ where: { id } });
        if (!goal || goal.userId !== req.user?.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: {
                ...(status !== undefined && { status }),
                ...(title !== undefined && { title }),
                ...(term !== undefined && { term })
            },
            include: { rules: true, habits: { include: { logs: true } } }
        });

        res.json(updatedGoal);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Server error updating goal' });
    }
});

// Delete a goal
router.delete('/:id', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        const goal = await prisma.goal.findUnique({ where: { id } });
        if (!goal || goal.userId !== req.user?.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.goal.delete({ where: { id } });
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Server error deleting goal' });
    }
});

// Update a system rule
router.patch('/rules/:ruleId', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const ruleId = req.params.ruleId as string;
        const { completed, status, text } = req.body;

        const rule = await prisma.systemRule.findUnique({
            where: { id: ruleId },
            include: { goal: true }
        });

        if (!rule || (rule as any).goal.userId !== req.user?.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updatedRule = await prisma.systemRule.update({
            where: { id: ruleId },
            data: {
                ...(completed !== undefined && { completed }),
                ...(status !== undefined && { status }),
                ...(text !== undefined && { text })
            }
        });

        res.json(updatedRule);
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ error: 'Server error updating rule' });
    }
});

export default router;