import type { Member, Post, Project } from "@prisma/client";
import type { MemberItem } from "./members";

// Post type with all related fields
export type PostItem = Post & {author: MemberItem, project: Project, _count: { likes: number }, likes: { memberId: number }[]};
