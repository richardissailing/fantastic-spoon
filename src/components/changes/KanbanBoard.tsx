import React, { useCallback, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Change, Status } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettings } from '@/utils/SettingsContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/router';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
  changes: Change[];
  onChangeMove: (result: DropResult, confirmed?: boolean) => void;
}

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'PENDING', title: 'Pending' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'COMPLETED', title: 'Completed' }
];

interface ValidationDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  type: 'warning' | 'completion';
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ changes, onChangeMove }) => {
  const { formatDate } = useSettings();
  const router = useRouter();
  const [pendingMove, setPendingMove] = useState<DropResult | null>(null);
  const [validationDialog, setValidationDialog] = useState<ValidationDialogState>({
    isOpen: false,
    title: '',
    description: '',
    type: 'warning'
  });

  const getColumnChanges = useCallback((status: Status) => {
    return changes.filter(change => change.status === status);
  }, [changes]);

  const isChangeApproved = (changeId: string): boolean => {
    const change = changes.find(c => c.id === changeId);
    return !!change?.approvedBy;
  };

  const validateMove = (source: Status, destination: Status, changeId: string): boolean => {
    const change = changes.find(c => c.id === changeId);
    if (!change) return false;

    // Rules:
    // 1. From PENDING to IN_PROGRESS requires approval
    // 2. From IN_PROGRESS can only go to COMPLETED
    // 3. From PENDING can't go directly to COMPLETED

    if (source === 'PENDING' && destination === 'IN_PROGRESS') {
      if (!isChangeApproved(changeId)) {
        setValidationDialog({
          isOpen: true,
          title: 'Change Not Approved',
          description: 'This change request must be approved before it can be moved to In Progress.',
          type: 'warning'
        });
        return false;
      }
      return true;
    }

    if (source === 'PENDING' && destination === 'COMPLETED') {
      setValidationDialog({
        isOpen: true,
        title: 'Invalid Movement',
        description: 'Changes must go through In Progress before being marked as Completed.',
        type: 'warning'
      });
      return false;
    }

    if (source === 'IN_PROGRESS' && destination !== 'COMPLETED') {
      setValidationDialog({
        isOpen: true,
        title: 'Invalid Movement',
        description: 'Changes in progress can only be moved to Completed.',
        type: 'warning'
      });
      return false;
    }

    return true;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    // Prevent dropping in the same location
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Validate the move based on business rules
    if (!validateMove(
      source.droppableId as Status,
      destination.droppableId as Status,
      draggableId
    )) {
      return;
    }

    // If moving to completed status, show confirmation dialog
    if (destination.droppableId === 'COMPLETED') {
      setPendingMove(result);
      setValidationDialog({
        isOpen: true,
        title: 'Complete Change Request',
        description: 'Are you sure you want to mark this change as completed? This will notify all stakeholders.',
        type: 'completion'
      });
      return;
    }

    onChangeMove(result);
  };

  const handleCardClick = (changeId: string) => {
    router.push(`/changes/${changeId}`);
  };

  const closeDialog = () => {
    setValidationDialog(prev => ({ ...prev, isOpen: false }));
    setPendingMove(null);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(({ id: status, title }) => (
            <div key={status} className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-semibold mb-4 text-foreground flex items-center justify-between">
                {title}
                <Badge variant="secondary" className="ml-2">
                  {getColumnChanges(status).length}
                </Badge>
              </h3>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      space-y-3 min-h-[calc(100vh-12rem)]
                      ${snapshot.isDraggingOver ? 'bg-muted/80' : ''}
                      transition-colors duration-200 rounded-lg p-2
                    `}
                  >
                    {getColumnChanges(status).map((change, index) => (
                      <Draggable
                        key={change.id}
                        draggableId={change.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => !snapshot.isDragging && handleCardClick(change.id)}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            className={`
                              ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}
                              transition-shadow duration-200
                              cursor-pointer
                            `}
                          >
                            <Card className="bg-background border hover:shadow-md">
                              <CardContent className="p-4 space-y-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium text-sm text-foreground">
                                      {change.title}
                                    </div>
                                    {change.approvedBy && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant="secondary">{change.priority}</Badge>
                                    <Badge variant="outline">{change.impact}</Badge>
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Created {formatDate(new Date(change.createdAt))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={change.requestedBy.avatar} />
                                    <AvatarFallback>
                                      {change.requestedBy.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {change.requestedBy.name}
                                  </span>
                                </div>
                                {change.approvedBy && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Approved by {change.approvedBy.name}</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AlertDialog open={validationDialog.isOpen} onOpenChange={() => closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {validationDialog.type === 'warning' ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {validationDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {validationDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>
              Cancel
            </AlertDialogCancel>
            {validationDialog.type === 'completion' && (
              <AlertDialogAction onClick={() => {
                if (pendingMove) {
                  onChangeMove(pendingMove, true);
                }
                closeDialog();
              }}>
                Continue
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KanbanBoard;
