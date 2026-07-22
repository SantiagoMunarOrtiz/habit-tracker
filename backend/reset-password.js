const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'munarsantiago1@gmail.com';
  const newPassword = 'Tumaco.2002';
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log(`User with email ${email} not found.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log(`Successfully reset password for ${email}.`);
  console.log(`New temporary password: ${newPassword}`);
}

resetPassword()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
