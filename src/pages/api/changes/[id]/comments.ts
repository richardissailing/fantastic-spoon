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

  // GET comments
  if (req.method === 'GET') {
    try {
      const comments = await prisma.comment.findMany({
        where: { changeId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // POST new comment
  if (req.method === 'POST') {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    try {
      // Get the current user (using test user for now)
      const user = await prisma.user.findFirst({
        where: { email: 'richardissailing@gmail.com' }
      });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          userId: user.id,
          changeId: id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
