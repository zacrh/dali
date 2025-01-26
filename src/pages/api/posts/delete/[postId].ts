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

  console.log("post ID: ", postId, "member id: ", session?.user.member.id, "session: ", session);

const post = await prisma.post.delete({
    where: {
        id: postId,
        authorId: session?.user.member.id,
    },
    });
  

    if (!post) {
        return res.status(404).json({ error: "Post not found for profile" }); // either the post doesn't exist or the user doesn't have permission to delete it (hence not found for profile)
    }

    return res.status(200).json({ success: "Post deleted" });
}