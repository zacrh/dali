import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { Post } from "@prisma/client";
import { z } from 'zod';

const getPostQuerySchema = z.object({
    topic: z.string().default('all'),
    after: z.string().optional(),
    offset: z.string().transform((val) => parseInt(val, 10) || 0).default('0'), // default to 0 if no offset provided
});


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post[] | { error: string }>,
) {
    if (req.method !== 'GET') {
        res.status(405).send({ error: 'Invalid method' })
        return
    }

    const session = await getServerSession(req, res, authOptions);

    console.log('session', session)

    const { topic, after, offset } = getPostQuerySchema.parse(req.query);

    if (!session && topic == 'projectes') {
        // only allow /all
        res.status(401).send({ error: 'Unauthorized' })
        return;
    }

    console.log('topic', topic)

    let whereCondition;
    if (!topic.includes('profile')) {
        whereCondition = {
            ...(topic === 'projects' && {
                project: {
                    OR: [
                        {
                            members: {
                                some: {
                                    id: session?.user.member.id
                                }
                            },
                        },
                        {
                            owner: {
                                id: session?.user.member.id
                            }
                        }
                    ]
                }
            }),
            ...(after && {
                createdAt: {
                    gt: new Date(after)
                }
            })
        }
    } else {
        console.log('in here')
        const tokens = topic.split('__');
        const profileId = tokens[1];
        const topicType = tokens[2];
        whereCondition = {
            authorId: parseInt(profileId),
            ...(after && {
                createdAt: {
                    gt: new Date(after)
                }
            })
        }
    }
    

    // try {
        const posts = await prisma.post.findMany({
            where: whereCondition,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                        roles: {
                            select: {
                                role: true // get the role information (not just the alias)
                            }
                        }
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                        alias: true,
                        picture: true,
                    }
                },
                _count: {
                    select: {
                      likes: true, // like count
                    },
                  },
                ...(session?.user.member.id && {
                    likes: {
                      where: {
                        memberId: session?.user.member.id,
                      },
                      select: {
                        memberId: true, // Include any field to determine if the like exists
                      },
                    },
                }),
            },
            take: 30,
            skip: offset,
        });
    // } catch (e) {
    //     console.error('Error fetching posts', e.stack)
    //     res.status(500).json({ error: 'Error fetching posts' })
    //     return;
    // }


    // console.log('posts', posts)

    res.status(200).json(posts);
}