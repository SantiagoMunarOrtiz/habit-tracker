import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// In-memory definitions of the journey milestones matching habitService
const MILESTONES = [
  { id: '10_COMPLETION', name: 'Pink Day', description: '10 completions! Double digits.', required: 10, color: '#FF69B4', icon: 'Award' },
  { id: '21_COMPLETION', name: 'Classic Milestone', description: '21 days! A classic milestone.', required: 21, color: '#CD7F32', icon: 'Trophy' },
  { id: '66_COMPLETION', name: 'Science Milestone', description: 'Science says it takes 66 days to form a habit.', required: 66, color: '#C0C0C0', icon: 'Brain' },
  { id: '90_COMPLETION', name: 'Discipline Badge', description: '90 days of unyielding discipline.', required: 90, color: '#FFD700', icon: 'Shield' },
  { id: '180_COMPLETION', name: 'Identity Badge', description: 'Half a year of success. This is who you are now.', required: 180, color: '#9966CC', icon: 'UserCheck' },
  { id: '365_COMPLETION', name: 'Year Badge', description: 'A full year! Total mastery.', required: 365, color: '#b9f2ff', icon: 'CalendarCheck' },
];

router.get('/checklist', async (req, res) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Fetch all active habits for the user
    const habits = await prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { logs: { where: { status: 'completed' } } }
    });

    // 2. We use HabitAchievement directly to track claims per habit
    const claimedAchievements = await prisma.habitAchievement.findMany({
      where: { habit: { userId } }
    });

    const groupedChecklist = habits.map(habit => {
      const completions = habit.logs.length;
      
      const habitClaimed = claimedAchievements.filter(a => a.habitId === habit.id).map(a => a.achievementType);

      const milestones = MILESTONES.map(m => {
        let status = 'Locked';
        
        if (completions >= m.required) {
          status = 'Completed';
        }
        
        if (habitClaimed.includes(m.id)) {
          status = 'Claimed';
        } else if (completions > 0 && completions < m.required) {
          status = 'InProgress';
        }

        return {
          id: `${habit.id}_${m.id}`, // Unique ID for the frontend mapping
          achievementId: m.id,
          name: m.name,
          description: m.description,
          status,
          currentProgress: Math.min(completions, m.required),
          requiredProgress: m.required,
          badgeColor: m.color,
          icon: m.icon
        };
      });

      return {
        habitId: habit.id,
        habitTitle: habit.title,
        milestones
      };
    });

    res.json(groupedChecklist);
  } catch (error) {
    console.error('Checklist error:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

router.post('/:habitId/:achievementId/claim', async (req, res) => {
  const userId = (req as any).user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Ensure habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.habitId, userId }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const milestone = MILESTONES.find(m => m.id === req.params.achievementId);
    if (!milestone) {
      return res.status(400).json({ error: 'Invalid achievement ID' });
    }

    await prisma.habitAchievement.create({
      data: {
        habitId: habit.id,
        achievementType: milestone.id,
        name: milestone.name,
        description: milestone.description
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ error: 'Failed to claim achievement' });
  }
});

export default router;
