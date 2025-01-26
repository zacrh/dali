import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PostFeed from "./postFeed";

export default function Feed() {
    const { data: session, status } = useSession();
    const [currentFeed, setCurrentFeed] = useState<"For You"|"Following">("For You");

    const onFeedClick = (feed: "For You"|"Following") => {
        setCurrentFeed(feed);
        console.log('setting feed to', feed);
    }

    return(
        <div className="flex flex-col w-3/5 w-[52%] h-full overflow-scroll border-l border-r border-gray-200 dark:border-tertiary">
            <div className="flex flex-col w-full">
                {
                    session?.user.member.id && (
<div className="flex flex-row w-full px-3 mb-2">
                    <div className="w-1/12 h-12 rounded-lg" />
                    <div className="w-10/12 h-12 flex items-center justify-center">
                    <div className="flex w-max pt-4 bg-primary">
                        <Image
                            src="/dalibook.png"
                            priority
                            alt="Logo"
                            className="w-9 rounded-sm"
                            width={500}
                            height={500}
                            />
                            </div>
                    </div>
                    <Link href="/projects" className="w-1/12 h-12 flex items-center pt-6 justify-center">
                        <div className="flex items-center justify-center h-max rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hash w-6 h-6 text-gray-600 dark:text-slate-500"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                        </div>
                    </Link>
                </div>
                    )
                }
                
                <div className="flex flex-row w-full border-b border-gray-200 dark:border-tertiary  ">
                    <div className="w-1/2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onFeedClick("For You")}>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-md font-semibold py-1.5 pt-3">For You</p>
                            <div className={`w-1/2 h-[3px] bg-primary rounded-t-lg ${currentFeed !== "For You" && 'translate-y-[100%]'} transition-transform duration-100`} />
                        </div>
                    </div>
                    {
                        session?.user.member.id ? (
                            <div className="w-1/2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onFeedClick("Following")}>
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-md font-semibold py-1.5 pt-3">Following</p>
                                    <div className={`w-1/2 h-[3px] bg-primary rounded-t-lg ${currentFeed !== "Following" && 'translate-y-[100%]'} transition-transform duration-100`} />
                                </div>
                            </div>
                        ) : (
                            <Link href="/projects" className="w-1/2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200 overflow-hidden cursor-pointer">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-md font-semibold py-1.5 pt-3">Projects</p>
                                </div>
                            </Link>
                        )
                    }
                   
                </div>
            </div>
            <PostFeed subject={currentFeed} session={session} />
        </div>
    )
}
