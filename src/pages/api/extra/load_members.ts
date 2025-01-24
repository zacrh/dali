import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const members_url = "https://file.notion.so/f/f/18c4d430-a651-43c3-a3cb-b60a5d7dff60/26f362af-0a5c-410b-b275-f2e886d6a020/dali_social_media.json?table=block&id=136fe958-d92f-80a2-a1ac-e1cb5783590d&spaceId=18c4d430-a651-43c3-a3cb-b60a5d7dff60&expirationTimestamp=1736985600000&signature=4GtX2cEUYlGDzuBj_2_RtYtNWUlZ0vXNQpdR_0T5GnU&downloadName=dali_social_media.json"

type MemberData = {
    name: string,
    year: string,
    dev: boolean,
    des: boolean,
    pm: boolean,
    core: boolean,
    mentor: boolean,
    major: string,
    minor: string|null,
    birthday: string,
    home: string,
    quote: string,
    "favorite thing 1": string,
    "favorite thing 2": string,
    "favorite thing 3": string,
    "favorite dartmouth tradition": string|null,
    "fun fact": string|null,
    picture: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

    fetch(members_url).then(res => res.json()).then(async (res: MemberData[]) => {
        console.log('in here')
        // Create Role Records
        // const newRoles = await prisma.role.createMany({
        //     data: [
        //         { alias: 'dev', name: 'Developer' },
        //         { alias: 'des', name: 'Designer' },
        //         { alias: 'pm', name: 'Product Manager' },
        //         { alias: 'core', name: 'Core' },
        //         { alias: 'mentor', name: 'Mentor' }
        //         { alias: 'applicant', name: 'Applicant' }
        //     ]
        // })
        console.log('test')

        for (const member of res) {
            console.log('Adding member, ', member.name)
            const exists = await prisma.member.findFirst({
                where: {
                  name: member.name,
                },
            });
            if (exists) {
                continue
            }
            // Add Member
            const newMember = await prisma.member.create({
                data: {
                    name: member.name,
                    picture: member.picture,
                    year: member.year,
                    major: member.major,
                    minor: member.minor,
                    birthday: member.birthday,
                    home: member.home
                }
            })

            // Add their attributes
            let attributes = [
                { name: 'quote', value: member.quote, memberId: newMember.id },
                { name: 'favorite thing 1', value: member["favorite thing 1"], memberId: newMember.id },
                { name: 'favorite thing 2', value: member["favorite thing 2"], memberId: newMember.id },
                { name: 'favorite thing 3', value: member["favorite thing 3"], memberId: newMember.id },
            ]

            if (member["favorite dartmouth tradition"]) { attributes.push({ name: 'favorite dartmouth tradition', value: member["favorite dartmouth tradition"], memberId: newMember.id }) }
            if (member["fun fact"]) { attributes.push({ name: 'fun fact', value: member["fun fact"], memberId: newMember.id }) }

            console.log(attributes)
            attributes.forEach(attr => {
                if (!attr.name || !attr.value || !attr.memberId) {
                    throw new Error(`Invalid attribute: ${JSON.stringify(attr)}`);
                }
            });
            const newAttributes = await prisma.attribute.createMany({
                data: attributes
            })
            console.log("didn't fail", newAttributes)

            // Add their role(s)
            let memberRoles = []

            if (member.dev) { memberRoles.push({ roleAlias: 'dev', memberId: newMember.id })}
            if (member.des) { memberRoles.push({ roleAlias: 'des', memberId: newMember.id })}
            if (member.pm) { memberRoles.push({ roleAlias: 'pm', memberId: newMember.id })}
            if (member.core) { memberRoles.push({ roleAlias: 'core', memberId: newMember.id })}
            if (member.mentor) { memberRoles.push({ roleAlias: 'mentor', memberId: newMember.id })}

            const newMemberRoles = await prisma.memberRole.createMany({
                data: memberRoles
            })
            console.log("created, ", newMemberRoles)
        }
    })

  res.status(200).json({ name: "John Doe" });
}