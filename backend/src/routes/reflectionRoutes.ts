import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "postgresql://neondb_owner:npg_s57lHUvtwBod@ep-young-wave-ap5ir4ms-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require" } } });

// Get reflections for a user within a date range
router.get('/user/:userId', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        if (req.user?.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const whereClause: any = { userId };
        
        if (startDate && endDate) {
            whereClause.date = {
                gte: startDate as string,
                lte: endDate as string
            };
        }

        const reflections = await prisma.dailyReflection.findMany({
            where: whereClause,
            include: { goal: true, habit: true },
            orderBy: { date: 'desc' }
        });

        res.json(reflections);
    } catch (error) {
        console.error('Error fetching reflections:', error);
        res.status(500).json({ error: 'Server error fetching reflections' });
    }
});

// Get reflection for a specific date
router.get('/user/:userId/date/:date', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    try {
        const { userId, date } = req.params as { userId: string, date: string };

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
    } catch (error) {
        console.error('Error fetching reflection for date:', error);
        res.status(500).json({ error: 'Server error fetching reflection' });
    }
});

// Create or Update (Upsert) a daily reflection
router.post('/', authenticateToken as any, async (req: AuthRequest, res: Response) => {
    try {
        const { 
            date, note, focusRating, energyRating, satisfactionRating,
            q1Progress, q2Learned, q3Blocked, q4NextAction, q5ObstaclePlan,
            goalId, habitId, userId 
        } = req.body;
  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

  if ((req as any).user?.userId !== userId) return res.status(403).json({ error: 'Forbidden' });


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
    } catch (error) {
        console.error('Error saving reflection:', error);
        res.status(500).json({ error: 'Server error saving reflection' });
    }
});

export default router;
