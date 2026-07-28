// @ts-nocheck
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "postgresql://neondb_owner:npg_s57lHUvtwBod@ep-young-wave-ap5ir4ms-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require" } } });

router.get('/', async (req, res) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const gifts = await prisma.reward.findMany({ where: { userId } });
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mini gifts' });
  }
});

router.post('/', async (req, res) => {
  const userId = (req as any).user?.userId;
  const { name, targetLevel } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const gift = await prisma.reward.create({
      data: { name, type: 'UserConfigured', requiredCompletions: targetLevel, userId }
    });
    res.json(gift);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mini gift' });
  }
});

export default router;