import { useState, useEffect, useRef } from "react";
import { ProjectItem } from "@/types/projects";
import { useSession } from "next-auth/react";
import { Spinner } from "./spinner";
import Project from "./project";
import { usePreviousRoute } from "../context/PreviousRouteProvider";
import { useRouter } from 'next/router'
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Session } from "next-auth";
import ProjectSmall from "./projectSmall";

type ProjectsPageProps = {
    session: Session | null;
}

export default function ProjectsPage({ session }: ProjectsPageProps) {
    const [selfLoading, setSelfLoading] = useState<boolean>(false); // loading status of user's projects
    const [loading, setLoading] = useState<boolean>(false); // loading status of 'all' projects
    const [error, setError] = useState<string | null>(null);
    
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [userProjects, setUserProjects] = useState<ProjectItem[]>([]);

    const router = useRouter();
    const previousRoute = usePreviousRoute();


    useEffect(() => {
        const fetchProjects = async (mine: boolean) => {
            setLoading(true);
            try {
                const res = await fetch(mine ? `/api/projects/get?topic=self` : `/api/projects/all`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                if (mine) {
                    setUserProjects(data);
                } else {
                    setProjects(data);
                }
            } catch (error) {
                console.log('Error fetching projects:', error);
                setError("Something went wrong while fetching projects!");
            } finally {
                if (mine) {
                    setSelfLoading(false);
                } else {
                    setLoading(false);
                }
            }
        }

        if (session) {
            if (window.sessionStorage.getItem("userProjects")) {
                setUserProjects(JSON.parse(window.sessionStorage.getItem("userProjects")!));
            } else {
                fetchProjects(true);
            }
        }

        fetchProjects(false);
    }, [session])

    const onBackClick = () => {
        // check if prev page is this website, if not go to home
        if (previousRoute && previousRoute.startsWith("/")) {
            router.push(previousRoute); // go to previous route if it's on dalibook website
        } else {
            router.push("/"); // go home if external
        }
    }

    return (
      <div className="flex flex-col w-3/5 w-[52%] h-full overflow-scroll border-l border-r border-gray-200 dark:border-tertiary">
        

        <div className="flex flex-col w-full">
            <div className="flex flex-row gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-tertiary items-center">
                <button onClick={() => onBackClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                    <svg fill="none" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5"><path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z"></path></svg>
                </button>
                <h2 className="text-md font-semibold flex flex-row items-center gap-1">
                    Projects
                </h2>
            </div>            
            
            {
                selfLoading && (
                    <div className="flex items-center justify-center h-full">
                        <Spinner />
                    </div>
                )
            }
            {
                userProjects && (
                    <div className="flex flex-row gap-2 px-4 p-3 items-start border-b border-gray-200 dark:border-tertiary">
                        <div className="p-3.5 rounded-full bg-primaryhover text-primary h-max">
                            <svg fill="none" viewBox="0 0 24 24" width="24" height="24" className="h-6 w-6"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2H4Zm0 12a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2H4Zm-1-5a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm14-3a1 1 0 0 1 .92.606l1.342 3.132 3.132 1.343a1 1 0 0 1 0 1.838l-3.132 1.343-1.343 3.132a1 1 0 0 1-1.838 0l-1.343-3.132-3.132-1.343a1 1 0 0 1 0-1.838l3.132-1.343 1.343-3.132A1 1 0 0 1 17 9Zm0 3.539-.58 1.355a1 1 0 0 1-.526.525L14.539 15l1.355.58a1 1 0 0 1 .525.526L17 17.461l.58-1.355a1 1 0 0 1 .526-.525L19.461 15l-1.355-.58a1 1 0 0 1-.525-.526L17 12.539Z"></path></svg>
                        </div>
                        <div className="flex flex-col ">
                            <h3 className="text-lg font-semibold">Your Projects</h3>
                            <p className="text-sm text-gray-200 dark:text-slate-300">All the projects you're a part of, right in one place.</p>
                        </div>
                    </div>
                )
            }
            {
                userProjects.map((project) => (
                    <ProjectSmall key={project.id} session={session} projectData={project} />
                ))
            }

            <div className="flex flex-row gap-2 px-4 p-3 items-start border-b border-gray-200 dark:border-tertiary">
                <div className="p-3.5 rounded-full bg-primaryhover text-primary h-max">
                    <svg fill="none" viewBox="0 0 24 24" width="24" height="24" className="h-6 w-6"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M3 4a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm1 4a1 1 0 0 0 0 2h5a1 1 0 0 0 0-2H4Zm-1 7a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm9-8a4 4 0 1 1 7.446 2.032l.99.989a1 1 0 1 1-1.415 1.414l-.99-.989A4 4 0 0 1 12 12Zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path></svg>
                </div>
                <div className="flex flex-col ">
                    <h3 className="text-lg font-semibold">Discover Projects</h3>
                    <p className="text-sm text-gray-200 dark:text-slate-300 ">Determine what updates you see on your timeline! Projects let you stay updated on what you think matters most.</p>
                </div>
            </div>

            {
                projects.map((project) => (
                    <Project key={project.id} session={session} projectData={project} />
                ))
            }

            {loading && (
                <div className="flex items-center justify-center h-full mt-8">
                    <Spinner />
                </div>
            )}

            {error && (
            <div className="flex items-center justify-center h-full">
                <p>{error}</p>
            </div>
            )}
        </div>
      </div>
    );
}
