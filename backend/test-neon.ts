import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: "postgresql://neondb_owner:npg_s57lHUvtwBod@ep-young-wave-ap5ir4ms-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require" } } });
async function main() {
  const userId = 'c3a58129-23ca-4640-8956-61c7ae8c1193';
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
  console.log("Goals:", goals);
}
main().finally(() => prisma.$disconnect());
