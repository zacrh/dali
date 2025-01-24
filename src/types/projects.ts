import type { Project } from "@prisma/client";
import type { MemberItem } from "./members";

// Project type with all related fields (and counts)
export type ProjectItem = Project & {owner: MemberItem, members: MemberItem[], _count: { members: number, posts: number }};