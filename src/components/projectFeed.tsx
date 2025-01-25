import { useState, useEffect, useRef } from "react";
import { ProjectItem } from "@/types/projects";
import { useSession } from "next-auth/react";
import { Spinner } from "./spinner";
import Project from "./project";
import { usePreviousRoute } from "../context/PreviousRouteProvider";
import { useRouter } from 'next/router'
import { toast } from "react-hot-toast";
import Image from "next/image";
import ProjectDualFeed from "./projectDualFeed";
import { checkForAliasMismatch } from "@/lib/utils";

type ProjectFeedProps = {
    projectAlias: string;
  };

export default function ProjectFeed({ projectAlias }: ProjectFeedProps) {
    const { data: session, status } = useSession();
    const [currentFeed, setCurrentFeed] = useState<"Posts"|"People">("Posts");
    const [project, setProject] = useState<ProjectItem | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [joinLoading, setJoinLoading] = useState<boolean>(false);
    const [joined, setJoined] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);
    const router = useRouter();
    const previousRoute = usePreviousRoute();

    const onFeedClick = (feed: "Posts"|"People") => {
        setCurrentFeed(feed);
    }

    const onBackClick = () => {
        // check if prev page is this website, if not go to home
        if (previousRoute && previousRoute.startsWith("/")) {
            router.push(previousRoute); // go to previous route if it's on dalibook website
        } else {
            router.push("/"); // go home if external
        }
    }

    const onJoinClick = async () => {
        if (!session?.user.member.id) {
            router.push("/login");
            return;
        }

        if (!project) {
            return;
        }

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
    }

    const onMoreClick = () => {
        setMoreDropdownOpen(!moreDropdownOpen);
    }

    const onCopyClick = () => {
        // copy to clipboard
        navigator.clipboard.writeText("https://dali.0z.gg/project/" + projectAlias);
        toast.success("Copied to clipboard!");
        setMoreDropdownOpen(false);
    }

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectAlias}/get`);
                if (!res.ok)  {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                if (checkForAliasMismatch(projectAlias, data?.alias)) { // do this check because sometimes the user might got to a diff project page from this project page before the fetch is done
                    // project alias mismatch
                    return;
                } 
                setProject(data);
                // setJoined(data.members.some((member: { id: number }) => member.id === session?.user.member.id) || data.owner.id === session?.user.member.id);

                // cache project
                const cachedProjects = window.sessionStorage.getItem("projects") || "{}";
                window.sessionStorage.setItem("projects", JSON.stringify({ ...JSON.parse(cachedProjects), [projectAlias]: data }));
            } catch (error) {
                console.error("Error fetching project:", error);
                setError("Something went wrong while fetching project!");
            } finally {
                setLoading(false);
            }
        }

        if (projectAlias) {
            console.log('project alias', projectAlias, window.location.pathname);
            fetchProject();
            const cachedProjects = window.sessionStorage.getItem("projects") || "{}";
            if (Object.keys(JSON.parse(cachedProjects)).includes(projectAlias)) {
                setProject(JSON.parse(cachedProjects)[projectAlias]);
                setJoined(JSON.parse(cachedProjects)[projectAlias].members.some((member: { id: string }) => member.id === session?.user.member.id) || JSON.parse(cachedProjects)[projectAlias].owner.id === session?.user.member.id);
            }
            setLoading(false);
        }
    }, [projectAlias])

    useEffect(() => {
        setJoined(project?.members.some((member: { id: number }) => member.id === session?.user.member.id) || project?.owner.id === session?.user.member.id);
    }, [session, project])
    
    

    return (
        <div className="flex flex-col w-3/5 w-[52%] h-full overflow-scroll border-l border-r border-gray-200 dark:border-tertiary">
            {loading && (
                <div className="flex items-center justify-center h-full">
                    <Spinner />
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-full">
                        <p>{error}</p>
                    </div>
                )}
            {project && !loading && (
                <div className="flex flex-col w-full">
                    <div className="flex flex-col w-full">
                        <div className="flex flex-row gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-tertiary items-center">
                            <button onClick={() => onBackClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                                <svg fill="none" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5"><path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z"></path></svg>
                            </button>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-md font-semibold flex flex-row items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hash w-5 h-5 text-primary"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                                    {project.alias}
                                </h2>
                                <p className="text-xs font-medium text-gray-500 dark:text-slate-500 -mt-0.5">{project._count.posts} posts</p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 p-4 items-center">
                            {project.picture ? (
                                <Image
                                    src={project.picture}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-lg border border-gray-300 dark:border-tertiary"
                                    width={500}
                                    height={500}
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary" />
                            )}
                            <div className="flex flex-col gap w-full">
                                <div className="flex flex-row w-full justify-between items-center h-max">
                                    <h2 className="text-2xl font-semibold">{project.name} <span className="font-medium text-gray-500 dark:text-slate-500 ml-1">#{project.alias}</span></h2>
                                    <div className="flex flex-row items-end gap-2">
                                        {
                                            !joined && (
                                                <button onClick={() => onJoinClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                                                    {
                                                        joinLoading ? (
                                                            <Spinner size={5} borderSize={2} spinnerColor="slate-600" railColor="transparent" />
                                                        ) : (
                                                            <svg fill="none" width="20" viewBox="0 0 24 24" height="20" className="text-gray-600 dark:text-slate-500"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1Z"></path></svg>
                                                        )
                                                    }
                                                </button>
                                            )
                                        }
                                        <button onClick={() => onCopyClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                                            <svg fill="none" width="24" viewBox="0 0 24 24" height="24" className="w-5 h-5"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M12.707 3.293a1 1 0 0 0-1.414 0l-4.5 4.5a1 1 0 0 0 1.414 1.414L11 6.414v8.836a1 1 0 1 0 2 0V6.414l2.793 2.793a1 1 0 1 0 1.414-1.414l-4.5-4.5ZM5 12.75a1 1 0 1 0-2 0V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-7.25a1 1 0 1 0-2 0V19H5v-6.25Z"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-500">Created by {project.alias !== "dalibook" ? project.owner.name : "Dalibook"} · {project._count.members + 1} member{project._count.members === 0 ? '' : 's'}</p>
                            </div>
                        </div>
                        {
                            project.description && (
                                <div className="flex flex-col px-4">
                                    <p className="text-sm">{project.description}</p>
                                </div>
                            )
                        }
                        <div className="flex flex-row w-full border-b border-gray-200 dark:border-tertiary mt-4">
                            <div className="w-1/2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onFeedClick("Posts")}>
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-md font-semibold py-1.5 pt-3">Posts</p>
                                    <div className={`w-1/2 h-[3px] bg-primary rounded-t-lg ${currentFeed !== "Posts" && 'translate-y-[100%]'} transition-transform duration-100`} />
                                </div>
                            </div>
                            <div className="w-1/2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onFeedClick("People")}>
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-md font-semibold py-1.5 pt-3">People</p>
                                    <div className={`w-1/2 h-[3px] bg-primary rounded-t-lg ${currentFeed !== "People" && 'translate-y-[100%]'} transition-transform duration-100`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <ProjectDualFeed subject={currentFeed.toLowerCase()} projectAlias={project.alias} session={session} />
                </div>
            )}
        </div>
    )
}