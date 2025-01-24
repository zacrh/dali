import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Project } from "@prisma/client";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project | { error: string }>,
) {
    const session = await getServerSession(req, res, authOptions);
    const { projectAlias } = req.query

    const project = await prisma.project.findUnique({
        where: {
            alias: projectAlias as string
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
        }
    })

    if (project) {
        res.status(200).json(project);
    } else {
        res.status(404).send({ error: "Project not found" });
    }
}