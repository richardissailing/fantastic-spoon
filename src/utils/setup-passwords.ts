import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const DEFAULT_PASSWORD = 'ChangeMe123!';

const prisma = new PrismaClient();

async function setupPasswords() {
  try {
    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    console.log(`Found ${users.length} total users`);

    // Update users whose password needs to be set
    for (const user of users) {
      // Update user with default password if they don't have one
      if (!user.password || user.password.trim() === '') {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            password: hashedPassword,
          }
        });
        console.log(`Set default password for user: ${user.email}`);
      }
    }

    console.log('Password setup complete!');
    console.log('Default password for new users:', DEFAULT_PASSWORD);
    console.log('Please ensure users change their passwords on first login');

  } catch (error) {
    console.error('Error setting up passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPasswords()
  .catch(console.error)
  .finally(() => process.exit(0));