import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get total count and counts by status
    const [
      total,
      pending,
      inProgress,
      completed,
      recentChanges
    ] = await Promise.all([
      // Total count
      prisma.change.count(),
      
      // Pending count
      prisma.change.count({
        where: { status: Status.PENDING }
      }),
      
      // In Progress count
      prisma.change.count({
        where: { status: Status.IN_PROGRESS }
      }),
      
      // Completed count
      prisma.change.count({
        where: { status: Status.COMPLETED }
      }),
      
      // Recent changes
      prisma.change.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    return res.status(200).json({
      stats: {
        total,
        pending,
        inProgress,
        completed
      },
      recentChanges
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}