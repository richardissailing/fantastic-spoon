import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Status, Priority } from '@prisma/client';

const getDateRange = (period: string) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'thisWeek':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'thisMonth':
      startDate.setMonth(now.getMonth());
      startDate.setDate(1);
      break;
    case 'lastMonth':
      startDate.setMonth(now.getMonth() - 1);
      startDate.setDate(1);
      break;
    case 'lastQuarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    default:
      startDate.setMonth(now.getMonth());
      startDate.setDate(1);
  }

  return { startDate, endDate: now };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period = 'thisMonth' } = req.query;
    const { startDate, endDate } = getDateRange(period as string);

    const [
      changesByStatus,
      changesByPriority,
      recentChanges
    ] = await Promise.all([
      // Get changes by status
      prisma.$transaction([
        prisma.change.count({
          where: {
            status: Status.PENDING,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.change.count({
          where: {
            status: Status.IN_PROGRESS,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.change.count({
          where: {
            status: Status.COMPLETED,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.change.count({
          where: {
            status: Status.REJECTED,
            createdAt: { gte: startDate, lte: endDate }
          }
        })
      ]),

      // Get changes by priority
      prisma.$transaction([
        prisma.change.count({
          where: {
            priority: Priority.HIGH,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.change.count({
          where: {
            priority: Priority.MEDIUM,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.change.count({
          where: {
            priority: Priority.LOW,
            createdAt: { gte: startDate, lte: endDate }
          }
        })
      ]),

      // Get recent changes
      prisma.change.findMany({
        take: 10,
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        orderBy: {
          createdAt: 'desc'
        },
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

    const [pending, inProgress, completed, rejected] = changesByStatus;
    const [high, medium, low] = changesByPriority;

    return res.status(200).json({
      changesByStatus: {
        pending,
        inProgress,
        completed,
        rejected
      },
      changesByPriority: {
        high,
        medium,
        low
      },
      recentChanges,
      periodStart: startDate,
      periodEnd: endDate
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return res.status(500).json({ error: 'Failed to fetch report data' });
  }
}