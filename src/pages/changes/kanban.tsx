import React, { useEffect, useState, useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { api, type Change } from '@/lib/api-service';
import KanbanBoard from '@/components/changes/KanbanBoard';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ListTodo, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Role } from '@prisma/client';
import { AdminRoute } from '@/components/role-routes';

const KanbanView = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChanges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/changes');
      if (!response.ok) {
        throw new Error('Failed to fetch changes');
      }
      const data = await response.json();
      setChanges(data);
    } catch (error) {
      console.error('Error fetching changes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load changes",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const handleChangeMove = useCallback(async (result: DropResult, confirmed?: boolean) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If moving to completed and not confirmed, do nothing
    if (destination.droppableId === 'COMPLETED' && !confirmed) {
      return;
    }

    const updatedChanges = changes.map(change => 
      change.id === draggableId 
        ? { ...change, status: destination.droppableId as Change['status'] }
        : change
    );

    setChanges(updatedChanges);

    try {
      await api.updateChangeStatus(draggableId, {
        status: destination.droppableId as Change['status'],
        comment: `Status updated to ${destination.droppableId}`
      });

      toast({
        title: "Success",
        description: "Change status updated successfully",
      });
    } catch (error) {
      // Revert changes on error
      setChanges(changes);
      console.error('Error updating change status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update change status",
      });
    }
  }, [changes, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminRoute allowedRoles={[Role.ADMIN]}>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Change Board</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/changes')}
            className="gap-2"
          >
            <ListTodo className="h-4 w-4" />
            List View
          </Button>
          <Button
            onClick={() => router.push('/changes/new')}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            New Change Request
          </Button>
        </div>
      </div>
      
      <KanbanBoard 
        changes={changes}
        onChangeMove={handleChangeMove}
      />
    </div>
    </AdminRoute>
  );
};

export default KanbanView;
