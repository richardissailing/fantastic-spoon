export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  createdAt: string;
}

export interface Change {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: string;
  impact: string;
  systemsAffected: string[];
  requestedBy: User;
  approvedBy?: User | null;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}