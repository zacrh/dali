import type { Member } from "@prisma/client";
import type { Attribute } from "@prisma/client";
import type { MemberRole } from "@prisma/client";

// Member type without database-controlled fields — almost a 'work in progress' row
export type WorkingMember = Omit<Member, "id" | "createdAt" | "updatedAt"> & {attributes: Attribute[], roles: MemberRole[]};

// Attribtue type without database-controlled fields — almost a 'work in progress' row
export type WorkingAttribute = Omit<Attribute, "id" | "memberId">;

// MemberRole type without database-controlled fields — almost a 'work in progress' row; also include field to keep track of if we're removing it or not
export type WorkingMemberRole = Omit<MemberRole, "assignedAt" | "memberId"> & {checked?: boolean};
