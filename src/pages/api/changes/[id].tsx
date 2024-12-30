import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid change ID' });
  }

  if (req.method === 'GET') {
    try {
      const change = await prisma.change.findUnique({
        where: { id },
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

      if (!change) {
        return res.status(404).json({ error: 'Change not found' });
      }

      return res.status(200).json(change);
    } catch (error) {
      console.error('Error fetching change:', error);
      return res.status(500).json({ error: 'Failed to fetch change details' });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
