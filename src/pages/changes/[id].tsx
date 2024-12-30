'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommentSection from '@/components/changes/CommentSection';
import { Loader2, Copy } from 'lucide-react';
import { api, type Change } from '@/lib/api-service';
import { useToast } from "@/hooks/use-toast";
import { useSettings } from '@/utils/SettingsContext';
import type { Status } from '@prisma/client';

type ActionType = 'approve' | 'update' | 'complete' | 'cancel';

interface Props {
  // Add any props if needed
}

const ChangeDetailsPage: React.FC<Props> = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { formatDate } = useSettings();
  const { id } = router.query;
  const [change, setChange] = useState<Change | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchChange = async () => {
      if (!id || typeof id !== 'string') return;
      
      try {
        setLoading(true);
        const data = await api.getChange(id);
        setChange(data);
        setError(null);
      } catch (error) {
        setError('Failed to fetch change details');
        console.error('Error fetching change:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChange();
  }, [id]);

  const handleCopyChange = async () => {
    if (!change) return;

    try {
      setCopying(true);
      
      // Copy the change with the new api method
      const newChange = await api.copyChange(change.id, {
        title: `Copy of ${change.title}`,
        description: change.description,
        priority: change.priority,
        impact: change.impact,
        type: change.type,
        systemsAffected: change.systemsAffected,
        plannedStart: change.plannedStart,
        plannedEnd: change.plannedEnd,
      });
      
      toast({
        title: "Success",
        description: "Change request copied successfully",
      });

      // Navigate to the new change
      router.push(`/changes/${newChange.id}`);
    } catch (error) {
      console.error('Error copying change:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy change request",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleAction = async () => {
    if (!change || !actionType) return;

    setUpdating(true);
    try {
      let status: Status;
      let actionComment = comment;

      switch (actionType) {
        case 'approve':
          status = 'APPROVED';
          actionComment = comment || 'Change request approved';
          break;
        case 'update':
          status = 'IN_PROGRESS';
          actionComment = comment || 'Updates requested';
          break;
        case 'complete':
          status = 'COMPLETED';
          actionComment = comment || 'Change request completed';
          break;
        case 'cancel':
          status = 'CANCELLED';
          actionComment = comment || 'Change request cancelled';
          break;
        default:
          throw new Error('Invalid action type');
      }

      const updatedChange = await api.updateChangeStatus(change.id, {
        status,
        comment: actionComment,
      });

      setChange(updatedChange);
      setShowDialog(false);
      setComment('');
      
      toast({
        title: "Success",
        description: `Change ${status.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error('Error updating change:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update change",
      });
    } finally {
      setUpdating(false);
      setActionType(null);
    }
  };

  const openActionDialog = (action: ActionType) => {
    setActionType(action);
    setShowDialog(true);
  };

  const getStatusColor = (status: Status): string => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    } as const;
    return colors[status];
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    } as const;
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading change details...</span>
      </div>
    );
  }

  if (error || !change) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-red-500">{error || 'Change not found'}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isActionDisabled = (action: ActionType): boolean => {
    switch (action) {
      case 'approve':
        return ['APPROVED', 'COMPLETED', 'CANCELLED'].includes(change.status);
      case 'update':
        return ['COMPLETED', 'CANCELLED'].includes(change.status);
      case 'complete':
        return ['COMPLETED', 'CANCELLED'].includes(change.status) || change.status !== 'APPROVED';
      case 'cancel':
        return ['COMPLETED', 'CANCELLED'].includes(change.status);
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{change.title}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{change.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(change.status)}>
                    {change.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(change.priority)}>
                    {change.priority}
                  </Badge>
                  <Badge variant="outline">
                    Impact: {change.impact}
                  </Badge>
                  {change.type && (
                    <Badge variant="outline">
                      Type: {change.type}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested By</h4>
                    <p>{change.requestedBy.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Requested</h4>
                    <p>{formatDate(new Date(change.createdAt))}</p>
                  </div>
                  {change.plannedStart && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Planned Start</h4>
                      <p>{formatDate(new Date(change.plannedStart))}</p>
                    </div>
                  )}
                  {change.plannedEnd && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Planned End</h4>
                      <p>{formatDate(new Date(change.plannedEnd))}</p>
                    </div>
                  )}
                  {change.approvedBy && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved By</h4>
                      <p>{change.approvedBy.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <CommentSection changeId={change.id} />
        </div>

        {/* Actions Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                disabled={isActionDisabled('approve') || updating}
                onClick={() => openActionDialog('approve')}
              >
                Approve Change
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={isActionDisabled('update') || updating}
                onClick={() => openActionDialog('update')}
              >
                Request Updates
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={isActionDisabled('complete') || updating}
                onClick={() => openActionDialog('complete')}
              >
                Mark as Complete
              </Button>
              <Button 
                className="w-full" 
                variant="secondary"
                disabled={updating || copying}
                onClick={handleCopyChange}
              >
                {copying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Change
                  </>
                )}
              </Button>
              <Button 
                className="w-full" 
                variant="destructive"
                disabled={isActionDisabled('cancel') || updating}
                onClick={() => openActionDialog('cancel')}
              >
                Cancel Change
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Change'}
              {actionType === 'update' && 'Request Updates'}
              {actionType === 'complete' && 'Complete Change'}
              {actionType === 'cancel' && 'Cancel Change'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'cancel' 
                ? 'Please provide a reason for cancelling this change request'
                : 'Add a comment to explain your action (optional)'}
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment here..."
            className="min-h-[100px]"
            required={actionType === 'cancel'}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setComment('');
                setActionType(null);
              }}
              disabled={updating}
            >
              Close
            </Button>
            <Button
              variant={actionType === 'cancel' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={updating || (actionType === 'cancel' && !comment.trim())}
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChangeDetailsPage;