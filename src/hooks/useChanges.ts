import { useState, useEffect } from 'react';
import { api } from '@/lib/api-service';
import { Status } from '@prisma/client';

interface Change {
  id: string;
  title: string;
  description: string;
  status: Status;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateChangeData {
  title: string;
  description: string;
  priority?: string;
  impact?: string;
  systemsAffected?: string[];
}

export function useChanges() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const data = await api.getChanges();
      setChanges(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch changes'));
    } finally {
      setLoading(false);
    }
  };

  const addChange = async (changeData: CreateChangeData) => {
    try {
      const newChange = await api.addChange(changeData);
      setChanges(prev => [newChange, ...prev]);
      return newChange;
    } catch (error) {
      console.error('Error in addChange:', error);
      throw error;
    }
  };

  const updateChangeStatus = async (changeId: string, status: Status, comment?: string) => {
    try {
      const updatedChange = await api.updateChangeStatus(changeId, { status, comment });
      setChanges(prev => prev.map(change => 
        change.id === changeId ? updatedChange : change
      ));
      return updatedChange;
    } catch (error) {
      console.error('Error updating change status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  return {
    changes,
    loading,
    error,
    addChange,
    updateChangeStatus,
    refreshChanges: fetchChanges,
  };
}