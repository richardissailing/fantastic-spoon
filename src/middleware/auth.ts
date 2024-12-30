
import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

export interface AuthRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export function withAuth(
  handler: (req: AuthRequest, res: NextApiResponse) => Promise<void>,
  allowedRoles?: Role[]
) {
  return async (req: AuthRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      req.user = decoded;

      // Check role if specified
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}