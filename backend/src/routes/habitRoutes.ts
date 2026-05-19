import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getHabitAnalytics } from '../services/analyticsService';
import { checkInHabit } from '../services/habitService';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { 
    title, description, categoryId, userId,
    planType, difficulty, scheduleType, selectedDays, targetDaysPerWeek, restDays,
    timeOfDay, estimatedDuration, triggerCue, ifThenPlan, motivationPhrase, miniReward
  } = req.body;
  
  try {
    const habit = await prisma.habit.create({
      data: { 
        title, description, categoryId, userId,
        planType: planType || 'Personal',
        difficulty: difficulty || 'Medium',
        scheduleType: scheduleType || 'daily',
        selectedDays: selectedDays ? JSON.stringify(selectedDays) : null,
        targetDaysPerWeek: targetDaysPerWeek || null,
        restDays: restDays ? JSON.stringify(restDays) : null,
        timeOfDay, estimatedDuration, triggerCue, ifThenPlan, motivationPhrase, miniReward
      },
      include: { category: true }
    });
    res.json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.params.userId, isArchived: false },
      include: { category: true, logs: true },
    });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

router.put('/:id', async (req, res) => {
  const { 
    title, description, active,
    planType, difficulty, scheduleType, selectedDays, targetDaysPerWeek, restDays,
    timeOfDay, estimatedDuration, triggerCue, ifThenPlan, motivationPhrase, miniReward
  } = req.body;
  try {
    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data: { 
        title, description, active,
        planType, difficulty, scheduleType,
        selectedDays: selectedDays ? JSON.stringify(selectedDays) : undefined,
        targetDaysPerWeek,
        restDays: restDays ? JSON.stringify(restDays) : undefined,
        timeOfDay, estimatedDuration, triggerCue, ifThenPlan, motivationPhrase, miniReward
      },
      include: { category: true }
    });
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

router.get('/user/:userId/analytics', async (req, res) => {
  try {
    // We would map over the user's habits and call getHabitAnalytics.
    // For now, returning a stub array to unblock the client.
    res.json([]);
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ error: 'Failed to calculate analytics' });
  }
});

router.post('/:id/checkin', async (req, res) => {
  const { date, status, note } = req.body; 
  const habitId = req.params.id;
  try {
    const result = await checkInHabit(habitId, date, status, note);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log habit' });
  }
});

router.get('/user/:userId/recommendations', async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.params.userId },
      include: { logs: true }
    });

    let recommendation = "Keep up the great work! Start by adding a few habits to track.";

    if (habits.length > 0) {
      let mostSkippedHabit: any = null;
      let maxSkips = -1;

      habits.forEach(h => {
        const skips = h.logs.filter(l => l.status === 'skipped' || l.status === 'failed').length;
        if (skips > maxSkips) {
          maxSkips = skips;
          mostSkippedHabit = h;
        }
      });

      if (maxSkips > 2 && mostSkippedHabit) {
        recommendation = `You've missed "${mostSkippedHabit.title}" a few times. Consider reducing the difficulty or utilizing your If-Then plan!`;
      } else {
        const totalCompletions = habits.reduce((acc, h) => acc + h.logs.filter(l => l.status === 'completed').length, 0);
        if (totalCompletions > 5) {
          recommendation = "You're building solid momentum! Try adding a new habit to your 'Study' or 'Work' plan type.";
        } else {
          recommendation = "You're off to a good start! Remember to use your mini-rewards immediately after completing a habit.";
        }
      }
    }

    res.json({ recommendation });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

router.patch('/:id/archive', async (req, res) => {
  try {
    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data: { isArchived: true, deletedAt: new Date() }
    });
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive habit' });
  }
});

export default router;
