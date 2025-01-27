import { ReactNode } from "react";
import LeftNav from "@/components/left-nav";
import RightBar from "@/components/right-bar";
import { useSession } from "next-auth/react";
import Head from 'next/head'; 

interface LayoutProps {
    children: ReactNode;
}
  

export default function Layout({ children }: LayoutProps) {
    const { data: session, status } = useSession();


    return (
        
        <div className="flex h-screen w-screen items-center justify-center">
            <Head>
                <title>Dalibook</title>
            </Head>
            <div className="flex flex-row w-full h-full max-w-6xl justify-center">
                <LeftNav session={session} />
                {children}
                <RightBar session={session} />
            </div>
        </div>
      )
    
}