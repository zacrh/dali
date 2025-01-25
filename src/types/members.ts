import type { Member, Project } from "@prisma/client";
import type { Attribute } from "@prisma/client";
import type { MemberRole } from "@prisma/client";
import type { Role } from "@prisma/client";

// Member type without database-controlled fields — almost a 'work in progress' row
export type WorkingMember = Omit<Member, "id" | "createdAt" | "updatedAt"> & {attributes: Attribute[], roles: MemberRole[]};

// Attribtue type without database-controlled fields — almost a 'work in progress' row
export type WorkingAttribute = Omit<Attribute, "id" | "memberId">;

// MemberRole type without database-controlled fields — almost a 'work in progress' row; also include field to keep track of if we're removing it or not
export type WorkingMemberRole = Omit<MemberRole, "assignedAt" | "memberId"> & {checked?: boolean};

// MemberRole type with related fields (role information)
export type MemberRoleItem = MemberRole & {role: Role};

// Role item without member-related fields (response from Prisma)
export type RoleItem = { role: Role };

// Member type with all related fields
export type MemberItem = Member & {attributes: Attribute[], roles: RoleItem[], projects: Project[], _count: { projects: number, projectsOwned: number, posts: number, postLikes: number }};