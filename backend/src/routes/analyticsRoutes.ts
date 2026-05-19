import { Router } from 'express';
import { analyticsService } from '../services/analyticsService';

const router = Router();

// GET /analytics/daily?date=YYYY-MM-DD&habitId=optional
router.get('/daily', async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const date = req.query.date as string;
    const habitId = req.query.habitId as string;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
    }

    const stats = await analyticsService.getDailyStats(userId, date, habitId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

// GET /analytics/weekly?date=YYYY-MM-DD&habitId=optional
router.get('/weekly', async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const date = req.query.date as string;
    const habitId = req.query.habitId as string;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
    }

    const stats = await analyticsService.getWeeklyStats(userId, date, habitId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    res.status(500).json({ error: 'Failed to fetch weekly stats' });
  }
});

// GET /analytics/monthly?year=YYYY&month=MM&date=YYYY-MM-DD&habitId=optional
router.get('/monthly', async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);
    const dateStr = req.query.date as string;
    const habitId = req.query.habitId as string;
    
    if (isNaN(year) || isNaN(month)) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const stats = await analyticsService.getMonthlyStats(userId, year, month, dateStr, habitId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

// GET /analytics/yearly?year=YYYY&date=YYYY-MM-DD&habitId=optional
router.get('/yearly', async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year as string);
    const dateStr = req.query.date as string;
    const habitId = req.query.habitId as string;
    
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Year is required' });
    }

    const stats = await analyticsService.getYearlyStats(userId, year, dateStr, habitId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching yearly stats:', error);
    res.status(500).json({ error: 'Failed to fetch yearly stats' });
  }
});

export default router;
