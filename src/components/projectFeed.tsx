import { useState, useEffect, useRef } from "react";
import { ProjectItem } from "@/types/projects";
import { useSession } from "next-auth/react";
import { Spinner } from "./spinner";
import { usePreviousRoute } from "../context/PreviousRouteProvider";
import { useRouter } from 'next/router'
import { toast } from "react-hot-toast";
import Image from "next/image";
import ProjectDualFeed from "./projectDualFeed";
import { checkForAliasMismatch } from "@/lib/utils";
import Tooltip from "./tooltip";

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
        if (!joined) {
            try {
                const res = await fetch(`/api/projects/${project.alias}/join`);
                if (!res.ok) {
                    throw new Error("Failed to join project");
                }

                const data = await res.json();
                console.log(data);
                setJoined(data.joined);
                toast.success(`Joined ${project.alias}!`);

                // update cache
                const userProjects = JSON.parse(window.sessionStorage.getItem("userProjects") || "{}");
                // add project to userProjects
                userProjects[project.alias] = project;
                window.sessionStorage.setItem("userProjects", JSON.stringify(userProjects));
            } catch (e) {
                console.error(e);
                toast.error("Failed to join project");
            } finally {
                setJoinLoading(false);
            }
        } else {
            // leave project
            try {
                const res = await fetch(`/api/projects/${project.alias}/leave`);
                if (!res.ok) {
                    throw new Error("Failed to leave project");
                }
    
                const data = await res.json();
                console.log(data);
                setJoined(!data.left);
                toast.success(`Left ${project.alias}`);

                // update cache
                const userProjects = JSON.parse(window.sessionStorage.getItem("userProjects") || "{}");
                // remove project from userProjects
                delete userProjects[project.alias]; // could filter but less efficient
                window.sessionStorage.setItem("userProjects", JSON.stringify(userProjects));
            } catch (e) {
                console.error(e);
                toast.error("Failed to leave project");
            } finally {
                setJoinLoading(false);
            }
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
                setLoading(false);
            }
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
                                <svg className="w-16 h-16 min-w-16 rounded-lg bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary" width="58" height="58" viewBox="0 0 32 32" fill="none" stroke="none" data-testid="projectAvatarFallback"><path d="M28 0H4C1.79086 0 0 1.79086 0 4V28C0 30.2091 1.79086 32 4 32H28C30.2091 32 32 30.2091 32 28V4C32 1.79086 30.2091 0 28 0Z" fill="#335A9D"></path><path d="M22.1529 22.3542C23.4522 22.4603 24.7593 22.293 25.9899 21.8629C26.0369 21.2838 25.919 20.7032 25.6497 20.1884C25.3805 19.6735 24.9711 19.2454 24.4687 18.9535C23.9663 18.6617 23.3916 18.518 22.8109 18.5392C22.2303 18.5603 21.6676 18.7454 21.1878 19.0731M22.1529 22.3542C22.1489 21.1917 21.8142 20.0534 21.1878 19.0741ZM10.8111 19.0741C10.3313 18.7468 9.7687 18.5619 9.18826 18.5409C8.60781 18.5199 8.03327 18.6636 7.53107 18.9554C7.02888 19.2472 6.61953 19.6752 6.35036 20.1899C6.08119 20.7046 5.96319 21.285 6.01001 21.8639C7.23969 22.2964 8.5461 22.4632 9.84497 22.3531M10.8111 19.0741C10.1851 20.0535 9.84865 21.1908 9.84497 22.3531ZM19.0759 10.077C19.0759 10.8931 18.7518 11.6757 18.1747 12.2527C17.5977 12.8298 16.815 13.154 15.9989 13.154C15.1829 13.154 14.4002 12.8298 13.8232 12.2527C13.2461 11.6757 12.922 10.8931 12.922 10.077C12.922 9.26092 13.2461 8.47828 13.8232 7.90123C14.4002 7.32418 15.1829 7 15.9989 7C16.815 7 17.5977 7.32418 18.1747 7.90123C18.7518 8.47828 19.0759 9.26092 19.0759 10.077ZM25.2299 13.154C25.2299 13.457 25.1702 13.7571 25.0542 14.0371C24.9383 14.3171 24.7683 14.5715 24.554 14.7858C24.3397 15.0001 24.0853 15.1701 23.8053 15.2861C23.5253 15.402 23.2252 15.4617 22.9222 15.4617C22.6191 15.4617 22.319 15.402 22.039 15.2861C21.759 15.1701 21.5046 15.0001 21.2903 14.7858C21.0761 14.5715 20.9061 14.3171 20.7901 14.0371C20.6741 13.7571 20.6144 13.457 20.6144 13.154C20.6144 12.5419 20.8576 11.9549 21.2903 11.5222C21.7231 11.0894 22.3101 10.8462 22.9222 10.8462C23.5342 10.8462 24.1212 11.0894 24.554 11.5222C24.9868 11.9549 25.2299 12.5419 25.2299 13.154ZM11.3835 13.154C11.3835 13.457 11.3238 13.7571 11.2078 14.0371C11.0918 14.3171 10.9218 14.5715 10.7075 14.7858C10.4932 15.0001 10.2388 15.1701 9.95886 15.2861C9.67887 15.402 9.37878 15.4617 9.07572 15.4617C8.77266 15.4617 8.47257 15.402 8.19259 15.2861C7.9126 15.1701 7.6582 15.0001 7.4439 14.7858C7.22961 14.5715 7.05962 14.3171 6.94365 14.0371C6.82767 13.7571 6.76798 13.457 6.76798 13.154C6.76798 12.5419 7.01112 11.9549 7.4439 11.5222C7.87669 11.0894 8.46367 10.8462 9.07572 10.8462C9.68777 10.8462 10.2748 11.0894 10.7075 11.5222C11.1403 11.9549 11.3835 12.5419 11.3835 13.154Z" fill="white"></path><path d="M22 22C22 25.3137 19.3137 25.5 16 25.5C12.6863 25.5 10 25.3137 10 22C10 18.6863 12.6863 16 16 16C19.3137 16 22 18.6863 22 22Z" fill="white"></path></svg>
                            )}
                            <div className="flex flex-col gap w-full">
                                <div className="flex flex-row w-full justify-between items-center h-max">
                                    <h2 className="text-2xl font-semibold">{project.name} <span className="font-medium text-gray-500 dark:text-slate-500 ml-1">#{project.alias}</span></h2>
                                    <div className="flex flex-row items-end gap-2">
                                        {
                                            !(joined && project.ownerId === session?.user.member.id) && (project.alias !== "dali") && (session?.user.member.id) && (
                                                <Tooltip content={joined ? "Leave" : "Join"}>
                                                    <button onClick={() => onJoinClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                                                        {
                                                            joinLoading ? (
                                                                <Spinner size={5} borderSize={2} spinnerColor="slate-600" railColor="transparent" />
                                                            ) : (
                                                                !joined ? (
                                                                    <svg fill="none" width="20" viewBox="0 0 24 24" height="20" className="text-gray-600 dark:text-slate-500"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1Z"></path></svg>
                                                                ) : (
                                                                    <svg fill="none" width="20" viewBox="0 0 24 24" height="20" className="text-gray-600 dark:text-slate-500"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M7.416 5H3a1 1 0 0 0 0 2h1.064l.938 14.067A1 1 0 0 0 6 22h12a1 1 0 0 0 .998-.933L19.936 7H21a1 1 0 1 0 0-2h-4.416a5 5 0 0 0-9.168 0Zm2.348 0h4.472c-.55-.614-1.348-1-2.236-1-.888 0-1.687.386-2.236 1Zm6.087 2H6.07l.867 13h10.128l.867-13h-2.036a1 1 0 0 1-.044 0ZM10 10a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Z"></path></svg>
                                                                )
                                                            )
                                                        }
                                                    </button>
                                                </Tooltip>
                                            )
                                        }
                                        <button onClick={() => onCopyClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                                            <svg fill="none" width="24" viewBox="0 0 24 24" height="24" className="w-5 h-5"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M12.707 3.293a1 1 0 0 0-1.414 0l-4.5 4.5a1 1 0 0 0 1.414 1.414L11 6.414v8.836a1 1 0 1 0 2 0V6.414l2.793 2.793a1 1 0 1 0 1.414-1.414l-4.5-4.5ZM5 12.75a1 1 0 1 0-2 0V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-7.25a1 1 0 1 0-2 0V19H5v-6.25Z"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 dark:text-slate-500">Created by {project.owner.name} · {project._count.members + 1} member{project._count.members === 0 ? '' : 's'}</p>
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

                    <ProjectDualFeed subject={currentFeed.toLowerCase()} projectAlias={project.alias} projectOwnerId={project.ownerId} session={session} />
                </div>
            )}
        </div>
    )
}