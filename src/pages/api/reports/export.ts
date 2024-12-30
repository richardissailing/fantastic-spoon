import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

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

    const changes = await prisma.change.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
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
    });

    return res.status(200).json(changes);
  } catch (error) {
    console.error('Export API error:', error);
    return res.status(500).json({ error: 'Failed to export data' });
  }
}