import { Status } from '@prisma/client';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
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

export interface CreateChangeData {
  title: string;
  description: string;
  priority: string;
  impact: string;
  systemsAffected: string[];
}

export interface UpdateChangeData {
  title?: string;
  description?: string;
  priority?: string;
  impact?: string;
  systemsAffected?: string[];
}

export interface UpdateStatusData {
  status: Status;
  comment?: string;
}

class ApiService {
  private async fetchWithError(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          data?.error || `Failed to ${options.method || 'GET'} ${url}`,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors or other unexpected errors
      throw new ApiError(
        500,
        'Internal Error',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        { originalError: error }
      );
    }
  }

  // Changes
  async getChanges(): Promise<Change[]> {
    try {
      return await this.fetchWithError('/api/changes');
    } catch (error) {
      console.error('Failed to fetch changes:', error);
      throw error;
    }
  }

  async getChange(id: string): Promise<Change> {
    try {
      return await this.fetchWithError(`/api/changes/${id}`);
    } catch (error) {
      console.error(`Failed to fetch change ${id}:`, error);
      throw error;
    }
  }

  async addChange(data: CreateChangeData): Promise<Change> {
    try {
      return await this.fetchWithError('/api/changes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to create change:', error);
      throw error;
    }
  }

  async updateChange(id: string, data: UpdateChangeData): Promise<Change> {
    try {
      return await this.fetchWithError(`/api/changes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update change ${id}:`, error);
      throw error;
    }
  }

  async copyChange(sourceId: string): Promise<Change> {
    try {
      const response = await fetch(`/api/changes/${sourceId}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send empty object as body to avoid null
        body: JSON.stringify({}),
      });

      const result = await response.json();
      console.error(response.json)
      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          result.error || 'Failed to copy change'
        );
      }

      return result.data;
    } catch (error) {
      console.error('Copy change error:', error);
      throw new ApiError(
        500,
        'Internal Error',
        'Failed to copy change'
      );
    }
  }

  async deleteChange(id: string): Promise<void> {
    try {
      await this.fetchWithError(`/api/changes/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete change ${id}:`, error);
      throw error;
    }
  }

  // Status Updates
  async updateChangeStatus(changeId: string, data: UpdateStatusData): Promise<Change> {
    try {
      return await this.fetchWithError(`/api/changes/${changeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update status for change ${changeId}:`, error);
      throw error;
    }
  }

  // Comments
  async getComments(changeId: string): Promise<Comment[]> {
    try {
      return await this.fetchWithError(`/api/changes/${changeId}/comments`);
    } catch (error) {
      console.error(`Failed to fetch comments for change ${changeId}:`, error);
      throw error;
    }
  }

  async addComment(changeId: string, content: string): Promise<Comment> {
    try {
      return await this.fetchWithError(`/api/changes/${changeId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error(`Failed to add comment to change ${changeId}:`, error);
      throw error;
    }
  }

  async updateComment(changeId: string, commentId: string, content: string): Promise<Comment> {
    try {
      return await this.fetchWithError(`/api/changes/${changeId}/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error(`Failed to update comment ${commentId}:`, error);
      throw error;
    }
  }

  async deleteComment(changeId: string, commentId: string): Promise<void> {
    try {
      await this.fetchWithError(`/api/changes/${changeId}/comments/${commentId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw error;
    }
  }

  // Users
  async getCurrentUser(): Promise<User> {
    try {
      return await this.fetchWithError('/api/users/me');
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await this.fetchWithError('/api/users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }
}

// Export a single instance of the API service
export const api = new ApiService();
