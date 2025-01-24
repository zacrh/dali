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
                            <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary" />
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
