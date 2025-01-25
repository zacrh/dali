import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Member } from "@prisma/client";
import { MemberItem } from "@/types/members";

export type GetProjectMembersResponse = {
    project: string, // alias
    members: MemberItem[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetProjectMembersResponse | { error: string }>,
) {
    const { projectAlias } = req.query
    
    if (!projectAlias) {
        res.status(400).send({ error: "Missing project alias" });
        return;
    }

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
                    value: true,
                    memberId: true
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

    const resData = {
        project: projectAlias as string,
        members: members
    }

    if (members) {
        res.status(200).json(resData);
    } else {
        res.status(404).send({ error: "Members not found" });
    }
}