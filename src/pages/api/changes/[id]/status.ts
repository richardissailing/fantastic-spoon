import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';

interface UpdateChangeResponse {
  id: string;
  status: Status;
  requestedBy: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface ErrorResponse {
  error: string;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check content type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  try {
    const { id } = req.query;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid change ID' });
    }

    // Parse body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    const { status, comment } = body;

    // Validate required fields
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status is required and must be a string' });
    }

    // Validate status value
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
    if (!validStatuses.includes(status as Status)) {
      return res.status(400).json({
        error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get the current user
    const user = await prisma.user.findFirst({
      where: { email: 'richardissailing@gmail.com' }
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Use transaction for atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // Update the change
      const updatedChange = await tx.change.update({
        where: { id },
        data: {
          status: status as Status,
          approverId: ['APPROVED', 'COMPLETED'].includes(status) ? user.id : null,
        },
        include: {
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create comment if provided
      if (comment && typeof comment === 'string') {
        await tx.comment.create({
          data: {
            content: comment,
            userId: user.id,
            changeId: id,
          },
        });
      }

      return updatedChange;
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating change status:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return res.status(404).json({ error: 'Change not found' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to update change status' });
  }
}