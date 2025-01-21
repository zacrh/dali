import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Feed() {
    const { data: session, status } = useSession();

    return(
        <div className="flex flex-col w-2/4 h-full overflow-scroll border-l border-r border-gray-200 dark:border-border">
            <div className="flex flex-col w-full">
                <div className="w-1/12 h-12 rounded-lg" />
                <div className="w-10/12 h-12 flex items-center justify-center">
                    <Image
                        src="/dalibook.png"
                        priority
                        alt="Logo"
                        className="w-12 rounded-sm"
                        width={500}
                        height={500}
                        />
                </div>
                <div className="w-1/12 h-12 rounded-lg" />
            </div>
        </div>
    )
}
