import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Priority, Impact, Status, Role } from '@prisma/client';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`${req.method} /api/changes`, {
    body: req.body,
    query: req.query
  });

  if (req.method === 'POST') {
    try {
      console.log('Processing POST request');
      
      // Validate required fields
      const requiredFields = ['title', 'description', 'priority', 'type', 'impact'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          console.error(`Missing required field: ${field}`);
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      // Find or create test user
      let user = await prisma.user.findFirst({
        where: { email: 'richardissailing@gmail.com' },
      });

      console.log('Found user:', user);

      if (!user) {
        console.log('Creating new user...');
        user = await prisma.user.create({
          data: {
            email: 'richardissailing@gmail.com',
            name: 'richard',
            role: Role.USER,
          },
        });
        console.log('Created user:', user);
      }

      // Prepare change data
      const changeData = {
        title: req.body.title,
        description: req.body.description,
        status: Status.PENDING,
        priority: req.body.priority as Priority,
        type: req.body.type,
        impact: req.body.impact as Impact,
        requesterId: user.id,
        plannedStart: req.body.plannedStart ? new Date(req.body.plannedStart) : null,
        plannedEnd: req.body.plannedEnd ? new Date(req.body.plannedEnd) : null,
      };

      console.log('Creating change with data:', changeData);

      // Create the change
      const change = await prisma.change.create({
        data: changeData,
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

      console.log('Successfully created change:', change);
      return res.status(201).json(change);
    } catch (error) {
      console.error('Detailed error:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create change',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  if (req.method === 'GET') {
    try {
      console.log('Processing GET request');
      const changes = await prisma.change.findMany({
        orderBy: {
          createdAt: 'desc',
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
      
      console.log(`Successfully fetched ${changes.length} changes`);
      return res.status(200).json(changes);
    } catch (error) {
      console.error('Error fetching changes:', error);
      return res.status(500).json({ error: 'Failed to fetch changes' });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
