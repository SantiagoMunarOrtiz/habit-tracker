import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // get any user
  const user = await prisma.user.findFirst();
  if (!user) { console.log('no user'); return; }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'habit-tracker-dev-secret-key-for-local-dev-12345');
  console.log('token:', token);
}
main().catch(console.error);
