import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Member } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Member | { error: string }>,
) {
    const { memberId } = req.query

    const profile = await prisma.member.findUnique({
        where: {
            id: parseInt(memberId as string)
        },
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
                    role: true // get the role information (not just the alias)
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
            },
        }
    });


    if (profile) {
        res.status(200).json(profile);
    } else {
        res.status(404).send({ error: "Profile not found" });
    }
}