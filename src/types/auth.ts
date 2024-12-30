import type { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface ErrorResponse {
  error: string;
}

export interface AuthRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}
