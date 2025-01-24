import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Member } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Member[] | { error: string }>,
) {
    const { projectAlias } = req.query

    const members = await prisma.member.findMany({
        ...(projectAlias !== 'dalibook' && {
            where: {
                projects: {
                    some: {
                        alias: projectAlias as string
                    }
                }
            }
        }),
        include: {
            attributes: {
                select: {
                    id: true,
                    name: true,
                    value: true
                }
            },
            roles: {
                select: {
                    role: true
                }
            },
            projects: true,
            _count: {
                select: {
                    projects: true,
                    projectsOwned: true,
                    posts: true,
                    postLikes: true
                }
            }
        }
    })

    if (members) {
        res.status(200).json(members);
    } else {
        res.status(404).send({ error: "Members not found" });
    }
}