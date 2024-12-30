import { Role } from '@prisma/client';
import { ProtectedRoute } from './protected-route';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[Role.ADMIN]}>
    {children}
  </ProtectedRoute>
);

export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[Role.MANAGER, Role.ADMIN]}>
    {children}
  </ProtectedRoute>
);

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[Role.USER, Role.MANAGER, Role.ADMIN]}>
    {children}
  </ProtectedRoute>
);
