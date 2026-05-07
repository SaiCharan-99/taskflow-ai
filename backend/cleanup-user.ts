import { PrismaClient } from '@prisma/client';
async function main() {
  const p = new PrismaClient();
  // Delete any unverified users that are stuck
  const r = await p.user.deleteMany({ where: { isVerified: false, NOT: { email: { in: [] } } } });
  console.log('Deleted unverified stuck users:', r.count);
  await p.$disconnect();
}
main();
