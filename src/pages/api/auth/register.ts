import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { emailValidator, dartmouthEmailPattern } from "@/validations/email";

type Error = {
    error: string
}

type UserData = {
    email: string,
    id: number,
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<Error|UserData>) {
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Invalid method' })
        return
    }

    const { email, password } = await req.body;

    if (!emailValidator(email)) {
        res.status(401).send({ error: 'Please enter a valid, original Dartmouth email (not a Blitz alias)'})
        return
    }

    const exists = await prisma.user.findUnique({
        where: {
          email,
        },
    });

    if (exists) {
        res.status(400).json({ error: "User already exists" })
        return;
      } else {
        const user = await prisma.user.create({
          data: {
            email,
            password: await hash(password, 10),
          },
        });

        const match = email.match(dartmouthEmailPattern);

        const firstName = match[1] || null;
        const lastName = match[3] || null;
        const classYear = match[4] || null;

        if (firstName && lastName && classYear) {
            const fullName = firstName + " " + lastName

            // send exist query first to find specific row to update (we do this to avoid type errors that result from simply doing .update using name as our where selector since name isn't a unique field)
            // in production obviously this would be a concern, but not in this case since the only member rows that exist without a userId are those from the dali-provided test data, in which there are no records with duplicate names
            const memberExists = await prisma.member.findFirst({
                where: {
                    AND: [
                        {
                            name: fullName
                        },
                        {
                            userId: { not: null } // make sure member hasn't already been linked to dalibook account
                        }
                    ]
                }
            })

            if (memberExists) {
                // link dalibook account to dali member information
                const updateMember = await prisma.member.update({
                    where: {
                        id: memberExists.id
                    },
                    data: {
                        userId: user.id
                    }
                })
            }
        }


        
        const resUser = {
            email: user.email,
            id: user.id
        }
        
        return res.status(200).json(resUser);
      }
}