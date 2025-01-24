import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Post } from "@prisma/client";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]"
import { z } from 'zod';

const getPostQuerySchema = z.object({
    after: z.string().optional(),
    offset: z.string().transform((val) => parseInt(val, 10) || 0).default('0'), // default to 0 if no offset provided
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post[] | { error: string }>,
) {
    const session = await getServerSession(req, res, authOptions);
    const { projectAlias } = req.query

    const { after, offset } = getPostQuerySchema.parse(req.query);

    const posts = await prisma.post.findMany({
        where: {
            project: {
                alias: projectAlias as string
            }
        },
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
    })

    if (posts) {
        res.status(200).json(posts);
    } else {
        res.status(404).send({ error: "Posts not found" });
    }
}