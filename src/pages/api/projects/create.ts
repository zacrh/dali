import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { Post, Project } from "@prisma/client";

type ProjectData = {
    project: Project,
    created: boolean,
}

type Error = {
    error: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Error|ProjectData>) {
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Invalid method' })
        return
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.status(401).send({ error: 'Unauthorized' })
        return
    }
    
    const memberId = session.user.member.id;

    const { alias, name, description } = await req.body;

    if (!alias || !name) {
        res.status(400).send({ error: 'Invalid request' })
        return
    }

    const exists = await prisma.project.findUnique({
        where: {
          alias,
        },
    });

    if (exists) {
        res.status(400).json({ error: "This alias is taken!" })
        return;
      }

    const project = await prisma.project.create({
        data: {
            alias,
            name,
            description,
            owner: {
                connect: {
                    id: memberId
                }
            }
        }
    });

    if (!project) {
        res.status(500).send({ error: 'Failed to create project' })
        return
    }

    res.status(200).json({ project: project, created: true });
}