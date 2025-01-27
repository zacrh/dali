import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import type { Member } from "@prisma/client";
import WelcomeForm from "@/components/welcome-form";

// Member type without database-controlled fields — almost a 'work in progress' row
type WorkingMember = Omit<Member, "id" | "createdAt" | "updatedAt">;

import { Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next"
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

interface ServerSideProps {
    session: Session | null;
}

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<ServerSideProps>> {
    const session = await getServerSession(context.req, context.res, authOptions);
  
    return {
      props: {
        session: JSON.parse(JSON.stringify(session)),
      },
    }
}

export default function Onboarding({ session }: ServerSideProps) {
    const [email, setEmail] = useState("");
    const [memberData, setMemberData] = useState<WorkingMember | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            setEmail(session.user.email);
        }
    }, [session]);

    return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="z-10 w-full h-full max-w-6xl border-gray-100 dark:border-border">
        <div className="flex flex-col space-y-4 w-full">
            <div className="flex flex-col px-4 pb-8 sm:px-12">
                <div className="flex w-max pt-6 bg-primary">
                <Image
                src="/dalibook.png"
                priority
                alt="Logo"
                className="w-12 rounded-sm"
                width={500}
                height={500}
                />
                </div>
                <div className="flex flex-row justify-between items-center pt-6">
                    <h2 className="text-2xl font-semibold text-center">Finish setting up your Dalibook</h2> {/* Welcome to Dalibook */}
                    <div className="flex items-center justify-center">
                        <h4 className="text-md font-medium text-gray-600 dark:text-slate-500">{email}</h4>
                    </div>
                </div>
                <p className="mt-2 text-md text-gray-600 dark:text-slate-500">Enter some information about yourself to start posting!</p>
            </div>
        </div>
        {/* <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white dark:bg-secondary dark:border-border px-4 py-6 pt-8 text-center sm:px-16">
          <Link href="/">
            <Image
              src="/dalibook-wide.png"
              priority
              alt="Logo"
              className="w-40 rounded-sm"
              width={778}
              height={254}
            />
          </Link>
          <h3 className="text-xl font-semibold pt-1.5">Sign In</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-500">
            Enter your email — even if it's your first time
          </p>
        </div> */}
        <WelcomeForm />
      </div>
    </div>
    );
}