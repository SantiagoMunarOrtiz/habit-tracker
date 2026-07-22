import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration script to populate userId...');

  // SystemRules
  const systemRules = await prisma.systemRule.findMany({ include: { goal: true } });
  for (const rule of systemRules) {
    if (rule.goal && rule.goal.userId) {
      await prisma.systemRule.update({
        where: { id: rule.id },
        data: { userId: rule.goal.userId }
      });
    }
  }
  console.log(`Updated ${systemRules.length} SystemRules.`);

  // FocusSessions
  const focusSessions = await prisma.focusSession.findMany({ include: { task: true } });
  for (const session of focusSessions) {
    if (session.task && session.task.userId) {
      await prisma.focusSession.update({
        where: { id: session.id },
        data: { userId: session.task.userId }
      });
    }
  }
  console.log(`Updated ${focusSessions.length} FocusSessions.`);

  // HabitLogs
  const habitLogs = await prisma.habitLog.findMany({ include: { habit: true } });
  for (const log of habitLogs) {
    if (log.habit && log.habit.userId) {
      await prisma.habitLog.update({
        where: { id: log.id },
        data: { userId: log.habit.userId }
      });
    }
  }
  console.log(`Updated ${habitLogs.length} HabitLogs.`);

  // HabitReschedules
  const habitReschedules = await prisma.habitReschedule.findMany({ include: { habit: true } });
  for (const resch of habitReschedules) {
    if (resch.habit && resch.habit.userId) {
      await prisma.habitReschedule.update({
        where: { id: resch.id },
        data: { userId: resch.habit.userId }
      });
    }
  }
  console.log(`Updated ${habitReschedules.length} HabitReschedules.`);

  // HabitAchievements
  const habitAchievements = await prisma.habitAchievement.findMany({ include: { habit: true } });
  for (const ach of habitAchievements) {
    if (ach.habit && ach.habit.userId) {
      await prisma.habitAchievement.update({
        where: { id: ach.id },
        data: { userId: ach.habit.userId }
      });
    }
  }
  console.log(`Updated ${habitAchievements.length} HabitAchievements.`);

  // LifeReviewAreas
  const lifeReviewAreas = await prisma.lifeReviewArea.findMany({ include: { lifeReview: true } });
  for (const area of lifeReviewAreas) {
    if (area.lifeReview && area.lifeReview.userId) {
      await prisma.lifeReviewArea.update({
        where: { id: area.id },
        data: { userId: area.lifeReview.userId }
      });
    }
  }
  console.log(`Updated ${lifeReviewAreas.length} LifeReviewAreas.`);

  console.log('Migration completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });