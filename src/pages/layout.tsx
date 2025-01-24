import { ReactNode } from "react";
import LeftNav from "@/components/left-nav";
import RightBar from "@/components/right-bar";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-row w-full h-full max-w-5xl">
                <LeftNav />
                {children}
                <RightBar />
            </div>
        </div>
      )
    
}