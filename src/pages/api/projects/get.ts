import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { Project } from "@prisma/client";
import { z } from 'zod';

const getProjectQuerySchema = z.object({
    topic: z.string().default('all'),
    after: z.string().optional(),
    offset: z.string().transform((val) => parseInt(val, 10) || 0).default('0'), // default to 0 if no offset provided
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project[] | { error: string }>,
) {
    const session = await getServerSession(req, res, authOptions);
    const { topic, after, offset } = getProjectQuerySchema.parse(req.query);

    if (topic === 'self') {
        if (!session) {
            // Not signed in
            res.status(401).send({ error: "Unauthorized" });
            return;
        }

        if (session.user.member.id) {
            const projects = await prisma.project.findMany({
                where: {
                    OR: [
                        {
                            members: {
                                some: {
                                    id: session.user.member.id
                                }
                            }
                        },
                        {
                            owner: {
                                id: session.user.member.id
                            }
                        }
                    ],
                    ...(after && {
                        createdAt: {
                            gt: new Date(after)
                        }
                    })
                },
                include: {
                    owner: true,
                    members: {
                        where: {
                          id: session?.user.member.id,
                        },
                        select: {
                          id: true, // Include any field to determine if the like exists
                        },
                      },
                    _count: {
                        select: {
                            members: true,
                            posts: true,
                        }
                    }
                },
                take: 30,
                skip: offset,
            });

            res.status(200).json(projects);
        }
    }

    let whereCondition;
    if (topic.includes('profile')) {
        const tokens = topic.split('__');
        const profileId = tokens[1];
        const topicType = tokens[2];
        whereCondition = {
            OR: [
                {
                    members: {
                        some: {
                            id: parseInt(profileId)
                        }
                    }
                },
                {
                    owner: {
                        id: parseInt(profileId)
                    }
                }
            ],
            ...(after && {
                createdAt: {
                    gt: new Date(after)
                }
            })
        }
    }

    const projects = await prisma.project.findMany({
        where: whereCondition,
        include: {
            owner: true,
            members: {
                where: {
                  id: session?.user.member.id,
                },
                select: {
                  id: true, // Include any field to determine if the like exists
                },
              },
            _count: {
                select: {
                    members: true,
                    posts: true,
                }
            }
        },
        take: 30,
        skip: offset,
    });

    res.status(200).json(projects);

    res.end();
}