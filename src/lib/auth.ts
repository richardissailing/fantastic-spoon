import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
export const JWT_EXPIRES_IN = '24h';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function sanitizeUser(user: User) {
  const { password, resetToken, resetTokenExpiry, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function generatePasswordResetToken(email: string) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  return resetToken;
}

export async function isDefaultPassword(password: string): Promise<boolean> {
  return password === 'password';
}