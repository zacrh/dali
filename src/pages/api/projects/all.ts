import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]";
import { Project } from "@prisma/client";
import { z } from 'zod';

const getAllProjectsQuerySchema = z.object({
    offset: z.string().transform((val) => parseInt(val, 10) || 0).default('0'), // default to 0 if no offset provided
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project[] | { error: string }>,
) {
    const session = await getServerSession(req, res, authOptions);
    const { offset } = getAllProjectsQuerySchema.parse(req.query);

    const projects = await prisma.project.findMany({
        ...(session?.user.member.id && { // make sure we don't return any of the user's projects if they're signed in (since this endpoint is meant to be somewhat of a 'discover' page)
            where: {
                AND: [
                    {
                        NOT: {
                            members: {
                                some: {
                                    id: session.user.member.id
                                }
                            }
                        }
                    },
                    {
                        NOT: {
                            owner: {
                                id: session.user.member.id
                            }
                        }
                    }
                ]
            }
        }),
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
        take: 20,
        skip: offset,
        orderBy: {
            members: {
                _count: 'desc',
            }
        }
    });

    if (projects) {
        res.status(200).json(projects);
    } else {
        res.status(500).send({ error: "Failed to get projects" });
    }

    res.end();
}