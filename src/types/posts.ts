import type { Member, Post, Project } from "@prisma/client";
import type { MemberItem } from "./members";

// Author type (essentially just Member with roles since that's all we need)
type Author = {
    id: number,
    name: string,
    picture: string | null,
    roles: MemberItem["roles"]
}

// Post type with only strictly-necessary fields
type PostProject = {
    id: number,
    name: string | null,
    alias: string,
    picture: string | null,
}

// Post type with all related fields
export type PostItem = Post & {author: Author, project: PostProject, _count: { likes: number }, likes: { memberId: number }[]};