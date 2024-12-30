import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generatePasswordResetToken, hashPassword } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (req.body.token) {
      // Reset password with token
      const { token, newPassword } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return res.status(200).json({ message: 'Password reset successfully' });
    } else {
      // Request password reset
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists
        return res.status(200).json({ message: 'If an account exists, a reset link will be sent' });
      }

      const resetToken = await generatePasswordResetToken(email);

      // Here you would typically send an email with the reset token
      // For development, we'll just return it
      return res.status(200).json({ 
        message: 'Reset token generated',
        resetToken, // Remove this in production
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}