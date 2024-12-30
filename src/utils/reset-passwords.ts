import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function generateResetTokensForExistingUsers() {
  try {
    // Get all users who still have the temporary password
    const users = await prisma.user.findMany({
      where: {
        password: '$2a$12$K8RMxE/Qt9QmHPXHQVrhcOXY5LlgnLL8T4RGBQJ9QGRHFXk7zN6rK'
      }
    });

    for (const user of users) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });

      // Here you would typically send an email to the user with their reset link
      console.log(`Reset token generated for ${user.email}: ${resetToken}`);
    }

    console.log(`Generated reset tokens for ${users.length} users`);
  } catch (error) {
    console.error('Error generating reset tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateResetTokensForExistingUsers();