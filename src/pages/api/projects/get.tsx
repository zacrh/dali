import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { Project } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project[] | { error: string }>,
) {
    const session = await getServerSession(req, res, authOptions);

    if (session) {
        if (session.user.member.id) {
            const projects = await prisma.project.findMany({
                where: {
                    OR: [
                        {
                            members: {
                                some: {
                                    id: session.user.member.id
                                }
                            }
                        },
                        {
                            owner: {
                                id: session.user.member.id
                            }
                        }
                    ]
                }
            });

            res.status(200).json(projects);
        }
    } else {
        // Not signed in
        res.status(401).send({ error: "Unauthorized" });
    }
    res.end();
}