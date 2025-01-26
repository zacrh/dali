import type { Project } from "@prisma/client";
import type { MemberItem } from "./members";

// Project type without database-controlled fields — almost a 'work in progress' row
export type WorkingProject = Omit<Project, "id" | "createdAt" | "updatedAt" | "posts" | "members" | "owner">;

// Project type with all related fields (and counts)
export type ProjectItem = Project & {owner: MemberItem, members: MemberItem[], _count: { members: number, posts: number }};