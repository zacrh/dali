import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ left: boolean } | { error: string }>,
) {
    const session = await getServerSession(req, res, authOptions);
    const { projectAlias } = req.query;
    
    if (!session) {
        // Not signed in
        res.status(401).send({ error: "Unauthorized" });
        return;
    }

    const project = await prisma.project.findUnique({
        where: {
            alias: projectAlias as string
        }
    });

    if (!project) {
        res.status(404).send({ error: "Project not found" });
        return;
    }

    const member = await prisma.member.findUnique({
        where: {
            id: session.user.member.id
        }
    });

    if (!member) {
        res.status(404).send({ error: "Member not found" });
        return;
    }

    const leave = await prisma.project.update({
        where: {
            alias: projectAlias as string
        },
        data: {
            members: {
                disconnect: {
                    id: member.id
                }
            }
        }
    });

    if (leave) {
        res.status(200).json({ left: true });
    } else {
        res.status(500).send({ error: "Failed to leave project" });
    }
}