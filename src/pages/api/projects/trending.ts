import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { Project } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Project[] | { error: string }>,
) {

    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

    const projects = await prisma.project.findMany({
        where: {
            posts: {
              some: {
                createdAt: {
                  gte: yesterday, // Use calculated date directly
                },
              },
            },
          },
          include: {
            _count: {
              select: {
                posts: true, // Include the count of posts
              },
            },
          },
          orderBy: {
            posts: {
              _count: 'desc', // Order by the number of posts in descending order
            },
          },
          take: 5, // Limit the results to the top 5
    });

    res.status(200).json(projects);
}