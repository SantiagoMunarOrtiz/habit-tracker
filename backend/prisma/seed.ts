import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      name: 'First Step',
      description: 'Completed your very first habit.',
      unlockCondition: 'FIRST_HABIT',
      points: 50,
      message: 'You have taken your first step into a larger world!'
    },
    {
      name: '7-Day Streak',
      description: 'Completed a habit 7 days in a row.',
      unlockCondition: '7_DAY_STREAK',
      points: 100,
      message: 'You are building real consistency!'
    },
    {
      name: 'Golden Day',
      description: 'Completed all mandatory habits for a single day.',
      unlockCondition: 'GOLDEN_DAY',
      points: 150,
      message: 'A perfect day! Keep the momentum going.'
    },
    {
      name: 'Consistent Week',
      description: 'Had a perfect week across all habits.',
      unlockCondition: 'PERFECT_WEEK',
      points: 300,
      message: 'Unstoppable! You nailed the whole week.'
    }
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: a.unlockCondition }, // We'll just rely on creating if not exists based on name, actually let's use a standard upsert by finding first.
      update: {},
      create: a,
    });
  }
}

// Since we don't have a unique constraint on 'name' or 'unlockCondition', let's just delete all achievements first to be safe for seed.
async function seed() {
  await prisma.achievement.deleteMany({});
  
  const achievements = [
    {
      name: 'First Step',
      description: 'Completed your very first habit.',
      unlockCondition: 'FIRST_HABIT',
      points: 50,
      message: 'You have taken your first step into a larger world!'
    },
    {
      name: '7-Day Streak',
      description: 'Completed a habit 7 days in a row.',
      unlockCondition: '7_DAY_STREAK',
      points: 100,
      message: 'You are building real consistency!'
    },
    {
      name: 'Golden Day',
      description: 'Completed all mandatory habits for a single day.',
      unlockCondition: 'GOLDEN_DAY',
      points: 150,
      message: 'A perfect day! Keep the momentum going.'
    },
    {
      name: 'Consistent',
      description: 'Reach a 30 day streak.',
      unlockCondition: '30_DAY_STREAK',
      points: 500,
      message: 'Amazing dedication!'
    }
  ];

  for (const a of achievements) {
    await prisma.achievement.create({ data: a });
  }

  console.log('Database seeded with Achievements!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
