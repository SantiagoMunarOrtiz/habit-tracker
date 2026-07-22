const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'munarsantiago1@gmail.com' } });
  console.log(user);
}

check().finally(() => prisma.$disconnect());
