import NextAuth, { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { sendResendVerifyRequest, sendVerifyRequest } from "@/lib/sendVerifyRequest";
import { dartmouthEmailPattern } from "@/validations/email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {}
        if (!email || !password) {
          throw new Error("Missing username or password");
        }
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        // if user doesn't exist or password doesn't match
        if (!user || !user.password || !(await compare(password, user.password))) {
          throw new Error("Invalid username or password");
        }
        return {
          id: user.id.toString(),
          email: user.email,
          // add other fields if necessary
        };
      },
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        process.env.NODE_ENV === "development" ? (
          sendVerifyRequest({ identifier: email, url: url, provider: { server: server as string, from: from } })
        ) : (
          sendResendVerifyRequest({ identifier: email, url: url, provider: { server: server as string, from: from } })
        )
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding' // /welcome — used for new members
  },
  events: {
    async createUser(message) {
      const { user } = message;
      const { id, email } = user;
      const match = email?.match(dartmouthEmailPattern);
      
      // shouldn't happen, but just in case — mainly used so we don't encounter errors during testing
      if (!match) {
        return;
      }

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
                      userId: parseInt(id) // need parseInt to avoid type error (even tho id is already a number)
                  }
              })
          }
      }

      console.log("Done with custom createUser logic")
    }
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = await prisma.user.findUnique({
        where: {
          email: user.email,
        },
      }).then((user) => user?.id);
      session.user.member = await prisma.member.findFirst({
        where: {
          userId: parseInt(user.id) // need parseInt to avoid type error (even tho id is already a number)
        },
        include: {
          roles: true,
          attributes: true,
        }
      });
      session.user.name = null;
      session.user.image = null;
      return session;
    }
  }
};

export default NextAuth(authOptions);