import { useState, useEffect } from "react";
import { Project } from "@prisma/client";
import Link from "next/link";
import { Spinner } from "./spinner";

export default function RightBar() {
    const [trendingProjects, setTrendingProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrendingProjects = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/projects/trending");
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setTrendingProjects(data);
            } catch (error) {
                console.log('Error fetching trending projects:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTrendingProjects();
    }, [])

    return (
        <div className="flex flex-col w-1/5 h-full p-4">
            <div className="flex flex-col w-full mt-2 gap-2 w-full">
                <h2 className="text-sm font-semibold flex flex-row gap-1 items-center">
                    <svg fill="none" viewBox="0 0 24 24" width="16" height="16" className="text-primary"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="m18.192 5.004 1.864 5.31a1 1 0 0 0 1.887-.662L20.08 4.34c-.665-1.893-3.378-1.741-3.834.207l-3.381 14.449-2.985-9.605C9.3 7.531 6.684 7.506 6.07 9.355l-1.18 3.56-.969-2.312a1 1 0 0 0-1.844.772l.97 2.315c.715 1.71 3.159 1.613 3.741-.144l1.18-3.56 2.985 9.605c.607 1.952 3.392 1.848 3.857-.138l3.381-14.449Z"></path></svg>
                    Trending Projects
                </h2>
                
                {loading && <div className="flex items-center justify-center mt-8"><Spinner /></div>}

                {trendingProjects.map((project) => (
                    <Link href={`/projects/${project.alias}`} className="flex flex-row gap-2">
                        <button className="px-2 py-1 text-primary rounded-full border border-tertiary hover:bg-secondary text-sm font-medium flex flex-row gap-1 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hash w-4 h-4"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                            {/* {project === "dalibook" ? <p className="text-sm font-medium text-gray-400 dark:text-slate-400">Project</p> : <p className="text-sm font-medium text-gray-400 dark:text-slate-400">{project}</p>} */}
                            <p className="text-sm font-medium text-gray-400 dark:text-slate-400">{project.alias}</p>
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    )
}