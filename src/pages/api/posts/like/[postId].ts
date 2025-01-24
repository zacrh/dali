

//posts/like/[postId].ts

// like post endpoint

import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { postId } = req.query;

  if (typeof postId !== "string") {
    return res.status(400).json({ error: "Invalid request" });
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const like = await prisma.postLike.findFirst({
    where: {
      postId: post.id,
      memberId: session.user.member.id,
    },
  });

  console.log('method', req.method)
  if (like && req.method === "DELETE") {
    await prisma.postLike.delete({
      where: {
        postId_memberId: { // have to do this bc the primary key is a composite key (even tho it looks wacky)
            postId: like.postId,
            memberId: like.memberId,
        },
      },
    });
  } else {
    await prisma.postLike.create({
      data: {
        post: {
          connect: {
            id: post.id,
          },
        },
        member: {
          connect: {
            id: session.user.member.id,
          },
        },
      },
    });
  }

  res.status(200).json({});
}