import prisma from "@/lib/prisma";
import { Member } from "@prisma/client";
import { WorkingAttribute, WorkingMember, WorkingMemberRole } from "@/types/members";
import { NextApiRequest, NextApiResponse } from "next";

type Error = {
    error: string
}

type WorkingNewMember = WorkingMember & { newAttributes?: WorkingAttribute[], newRoles?: WorkingMemberRole[], id?: number }

interface CreateMemberNextAPIRequest extends NextApiRequest {
    body: Promise<WorkingNewMember>,
}

export default async function handler(req: CreateMemberNextAPIRequest, res: NextApiResponse<Error|Member>) {
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Invalid method' })
        return
    }

    const { name, year, userId, major, minor, birthday, home, picture, attributes, roles, id, newAttributes, newRoles } = await req.body;
    let memberId: number;

    // If the user is already a member (and has a member ID, denoted by the `id` key in the request body), update their information
    if (id) {
        // Update any fields that have changed
        const updatedMember = await prisma.member.update({
            where: {
                id: id
            },
            data: {
                name: name,
                year: year,
                major: major,
                minor: minor,
                birthday: birthday,
                home: home,
                picture: picture,
            }
        });

        // Update attributes
        const updatedAttributes = await Promise.all(
            attributes.map(({ id, value }) => 
                prisma.attribute.update({
                    where: { 
                        id
                    },
                    data: {
                        value
                    }
                })
            )
        );

        // Update roles — here just remove any roles that are marked as unchecked (i.e., no longer assigned)
        if (newRoles) {
            const updatedRoles = await Promise.all(
                newRoles?.map(({ roleAlias, checked }) => 
                    !checked && (
                        prisma.memberRole.delete({
                            where: {
                                memberId_roleAlias: {
                                    memberId: id,
                                    roleAlias
                                }
                            }
                        })
                    )
                )
            );
        }     

        memberId = updatedMember.id;
    } else {
        // Create the new member
        const newMember = await prisma.member.create({
            data: {
                name,
                year,
                major,
                minor,
                birthday,
                home,
                picture,
                userId
            }
        });

        memberId = newMember.id;
    }

    // Create new attributes and roles for both types of members (new and existing)
    if (newAttributes) {
        const createdAttributes = await prisma.attribute.createMany({
            data: newAttributes.map(({ name, value }) => ({ name, value, memberId }))
        });
    }

    if (newRoles) {
        const createdRoles = await Promise.all(
            newRoles.map(({ roleAlias, checked}) =>
                checked && (
                    prisma.memberRole.create({
                        data: {
                            roleAlias,
                            memberId
                        }
                    })
                )
            )
        );
    }

    const member = await prisma.member.findUnique({
        where: {
            id: memberId
        },
        include: {
            attributes: true,
            roles: true
        }
    });

    if (!member) {
        res.status(500).json({ error: "Something went wrong while creating member" });
        return;
    }

    res.status(200).json(member);
}