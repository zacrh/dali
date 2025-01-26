import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProjectItem } from "@/types/projects";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Spinner } from "./spinner";

type ProjectProps = {
    projectData: ProjectItem;
    session: Session | null;
};

export default function ProjectSmall({ projectData, session }: ProjectProps) {
    const [project, setProject] = useState<ProjectItem>(projectData);
    const router = useRouter();

    return (
        <Link key={project.alias} href={`/project/${project.alias}`} className="flex flex-col w-full border-b py-3 px-4 border-gray-200 dark:border-tertiary gap-2 hover:bg-gray-100 dark:hover:bg-posthover transition-colors">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-3">
                    {
                        project.picture ? (
                            <Image
                                src={project.picture}
                                alt="Avatar"
                                className="w-8 h-8 rounded-md border border-gray-300 dark:border-tertiary"
                                width={100}
                                height={100}
                            />
                        ) : (
                            <svg className="w-8 h-8 rounded-md bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary" width="29" height="29" viewBox="0 0 32 32" fill="none" stroke="none" data-testid="projectAvatarFallback"><path d="M28 0H4C1.79086 0 0 1.79086 0 4V28C0 30.2091 1.79086 32 4 32H28C30.2091 32 32 30.2091 32 28V4C32 1.79086 30.2091 0 28 0Z" fill="#335A9D"></path><path d="M22.1529 22.3542C23.4522 22.4603 24.7593 22.293 25.9899 21.8629C26.0369 21.2838 25.919 20.7032 25.6497 20.1884C25.3805 19.6735 24.9711 19.2454 24.4687 18.9535C23.9663 18.6617 23.3916 18.518 22.8109 18.5392C22.2303 18.5603 21.6676 18.7454 21.1878 19.0731M22.1529 22.3542C22.1489 21.1917 21.8142 20.0534 21.1878 19.0741ZM10.8111 19.0741C10.3313 18.7468 9.7687 18.5619 9.18826 18.5409C8.60781 18.5199 8.03327 18.6636 7.53107 18.9554C7.02888 19.2472 6.61953 19.6752 6.35036 20.1899C6.08119 20.7046 5.96319 21.285 6.01001 21.8639C7.23969 22.2964 8.5461 22.4632 9.84497 22.3531M10.8111 19.0741C10.1851 20.0535 9.84865 21.1908 9.84497 22.3531ZM19.0759 10.077C19.0759 10.8931 18.7518 11.6757 18.1747 12.2527C17.5977 12.8298 16.815 13.154 15.9989 13.154C15.1829 13.154 14.4002 12.8298 13.8232 12.2527C13.2461 11.6757 12.922 10.8931 12.922 10.077C12.922 9.26092 13.2461 8.47828 13.8232 7.90123C14.4002 7.32418 15.1829 7 15.9989 7C16.815 7 17.5977 7.32418 18.1747 7.90123C18.7518 8.47828 19.0759 9.26092 19.0759 10.077ZM25.2299 13.154C25.2299 13.457 25.1702 13.7571 25.0542 14.0371C24.9383 14.3171 24.7683 14.5715 24.554 14.7858C24.3397 15.0001 24.0853 15.1701 23.8053 15.2861C23.5253 15.402 23.2252 15.4617 22.9222 15.4617C22.6191 15.4617 22.319 15.402 22.039 15.2861C21.759 15.1701 21.5046 15.0001 21.2903 14.7858C21.0761 14.5715 20.9061 14.3171 20.7901 14.0371C20.6741 13.7571 20.6144 13.457 20.6144 13.154C20.6144 12.5419 20.8576 11.9549 21.2903 11.5222C21.7231 11.0894 22.3101 10.8462 22.9222 10.8462C23.5342 10.8462 24.1212 11.0894 24.554 11.5222C24.9868 11.9549 25.2299 12.5419 25.2299 13.154ZM11.3835 13.154C11.3835 13.457 11.3238 13.7571 11.2078 14.0371C11.0918 14.3171 10.9218 14.5715 10.7075 14.7858C10.4932 15.0001 10.2388 15.1701 9.95886 15.2861C9.67887 15.402 9.37878 15.4617 9.07572 15.4617C8.77266 15.4617 8.47257 15.402 8.19259 15.2861C7.9126 15.1701 7.6582 15.0001 7.4439 14.7858C7.22961 14.5715 7.05962 14.3171 6.94365 14.0371C6.82767 13.7571 6.76798 13.457 6.76798 13.154C6.76798 12.5419 7.01112 11.9549 7.4439 11.5222C7.87669 11.0894 8.46367 10.8462 9.07572 10.8462C9.68777 10.8462 10.2748 11.0894 10.7075 11.5222C11.1403 11.9549 11.3835 12.5419 11.3835 13.154Z" fill="white"></path><path d="M22 22C22 25.3137 19.3137 25.5 16 25.5C12.6863 25.5 10 25.3137 10 22C10 18.6863 12.6863 16 16 16C19.3137 16 22 18.6863 22 22Z" fill="white"></path></svg>
                        )
                    }
                    <div className="flex flex-col">
                        <h3 className="text-md font-semibold gap-2 flex items-center">{project.name} <span className="font-medium text-gray-500 dark:text-slate-500">#{project.alias}</span></h3>
                    </div>
                </div>
                <div className="flex p-1.5 rounded-md cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-right text-gray-600 dark:text-slate-500"><path d="m9 18 6-6-6-6"/></svg>
                </div>
            </div>
        </Link>
    )
}
