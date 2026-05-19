// @ts-nocheck
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const userId = (req as any).user?.userId;
  const { level, confirmation } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset' });
  }
});

export default router;
