import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const changes = await prisma.change.findMany({
        orderBy: {
          updatedAt: 'desc',
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

      return res.status(200).json(changes);
    } catch (error) {
      console.error('Error fetching changes:', error);
      return res.status(500).json({ error: 'Failed to fetch changes' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
