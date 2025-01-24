import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { Member } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Member[] | { error: string }>,
) {
    const session = await getServerSession(req, res, authOptions);
    const memberId = session?.user.member.id;

    const profile = await prisma.member.findUnique({
        where: {
            id: memberId
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
        }
    });

    if (profile) {
        res.status(200).json([profile]);
    } else {
        res.status(404).send({ error: "Profile not found" });
    }
}