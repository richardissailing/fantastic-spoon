import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
    },
  });

  // Create some initial changes
  const changes = await Promise.all([
    prisma.change.create({
      data: {
        title: 'Initial Database Setup',
        description: 'Setting up the production database environment',
        status: 'COMPLETED',
        priority: 'HIGH',
        type: 'INFRASTRUCTURE',
        impact: 'HIGH',
        requesterId: user.id,
      },
    }),
    prisma.change.create({
      data: {
        title: 'Security Update',
        description: 'Implementing new security protocols',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        type: 'SECURITY',
        impact: 'HIGH',
        requesterId: user.id,
      },
    }),
  ]);

  console.log({ user, changes });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
