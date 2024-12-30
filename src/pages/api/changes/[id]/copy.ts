import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';

interface ApiResponse {
  error?: string;
  data?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Check method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate ID
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid change ID' });
  }

  try {
    // Get the original change
    const sourceChange = await prisma.change.findUnique({
      where: { id },
      include: {
        systemsAffected: true,
        requestedBy: true,
      },
    });

    if (!sourceChange) {
      return res.status(404).json({ error: 'Source change not found' });
    }

    // Create new change data
    const newChangeData = {
      title: `Copy of ${sourceChange.title}`,
      description: sourceChange.description,
      status: 'PENDING' as Status,
      priority: sourceChange.priority,
      impact: sourceChange.impact,
      type: sourceChange.type,
      plannedStart: sourceChange.plannedStart,
      plannedEnd: sourceChange.plannedEnd,
      requestedBy: {
        connect: { id: sourceChange.requestedBy.id }
      },
      systemsAffected: {
        connect: sourceChange.systemsAffected.map(system => ({
          id: system.id
        }))
      },
    };

    // Create the new change
    const newChange = await prisma.change.create({
      data: newChangeData,
      include: {
        requestedBy: true,
        approvedBy: true,
        systemsAffected: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.status(201).json({ data: newChange });
  } catch (error) {
    console.error('Error copying change:', error);
    return res.status(500).json({ 
      error: 'Failed to copy change'
    });
  }
}
