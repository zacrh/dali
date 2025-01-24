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

export default function Project({ projectData, session }: ProjectProps) {
    const [project, setProject] = useState<ProjectItem>(projectData);
    const [joined, setJoined] = useState<boolean>(project.members.some((member) => member.id === session?.user.member.id) || project.owner.id === session?.user.member.id);
    const [joinLoading, setJoinLoading] = useState<boolean>(false);
    const router = useRouter();
    
    const onJoinClick = async () => {
        if (!session?.user.member.id) {
            router.push("/login");
            return;
        }
        // join/like project
        setJoinLoading(true);
        try {
            const res = await fetch(`/api/projects/${project.alias}/join`);
            if (!res.ok) {
                throw new Error("Failed to join project");
            }

            const data = await res.json();
            console.log(data);
            setJoined(data.joined);
            toast.success(`Joined ${project.alias}!`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to join project");
        } finally {
            setJoinLoading(false);
        }
    };

    return (
        <Link key={project.alias} href={`/project/${project.alias}`} className="flex flex-col w-full border-b py-3 px-4 border-gray-200 dark:border-tertiary gap-2 hover:bg-gray-100 dark:hover:bg-posthover transition-colors">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                    {
                        project.picture ? (
                            <Image
                                src={project.picture}
                                alt="Avatar"
                                className="w-10 rounded-md border border-gray-300 dark:border-tertiary"
                                width={100}
                                height={100}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary" />
                        )
                    }
                    <div className="flex flex-col">
                        <h3 className="text-md font-semibold gap-1 flex items-center">{project.name} <span className="font-medium text-gray-500 dark:text-slate-500">#{project.alias}</span></h3>
                        <p className="text-sm text-gray-500 dark:text-slate-500 -mt-0.5">Project by {project.owner.name}</p>
                    </div>
                </div>
                
                {
                    !joined && (
                        <div className="flex p-1.5 rounded-md cursor-pointer hover:bg-gray-300 dark:hover:bg-secondary transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onJoinClick(); }}>
                            {
                                joinLoading ? (
                                    <Spinner size={5} borderSize={2} spinnerColor="slate-600" railColor="transparent" />
                                ) : (
                                    <svg fill="none" width="20" viewBox="0 0 24 24" height="20" className="text-gray-600 dark:text-slate-500"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1Z"></path></svg>
                                )
                            }
                        </div>
                    )
                }
                
            </div>
            {project.description && (
                <p className="text-sm w-full">
                    {project.description}
                </p>
            )}
            <p className="text-sm text-gray-600 dark:text-slate-500">{project._count.members + 1} member{project._count.members === 0 ? '' : 's'}</p> {/* +1 for owner */}
        </Link>
    )
}
