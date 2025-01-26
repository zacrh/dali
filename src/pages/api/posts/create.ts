import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

type PostData = {
    postId: String,
    created: boolean,
}

type Error = {
    error: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Error|PostData>) {
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

    const { content, projectAlias, projectId } = await req.body;

    if (!content || (!projectAlias && !projectId)) {
        res.status(400).send({ error: 'Invalid request' })
        return
    }

    if (content.length > 255) {
        res.status(400).send({ error: 'Post content too long' })
        return
    }

    let postProjectId = projectId;

    if (projectAlias === 'dali') {
        postProjectId = 2
    } else if (!projectId) {
        const project = await prisma.project.findFirst({
            where: {
                alias: projectAlias
            }
        });

        if (!project) {
            res.status(400).send({ error: 'Invalid project' })
            return
        }

        postProjectId = project.id
    }

    const post = await prisma.post.create({
        data: {
            content,
            projectId: postProjectId,
            authorId: memberId,
        }
    });

    if (!post) {
        res.status(500).send({ error: 'Error creating post' })
        return
    }

    res.status(200).json({ postId: post.id, created: true });
}