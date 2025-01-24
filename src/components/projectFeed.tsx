import { useState, useEffect, useRef } from "react";
import { ProjectItem } from "@/types/projects";
import { Session } from "next-auth";
import { Spinner } from "./spinner";
import Project from "./project";

type ProjectFeedProps = {
    session: Session | null;
    subject: string;
  };

export default function ProjectFeed({ subject, session }: ProjectFeedProps) {
    const [topic, setTopic] = useState<string>("all");
    const [projects, setProjects] = useState<{ [key: string]: ProjectItem[] }>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    
    useEffect(() => {
        let temp_topic = topic;
        if (subject === "Discover") {
            setTopic("all");
            temp_topic = "all";
        } else {
            setTopic(subject.toLowerCase());
            temp_topic = subject.toLowerCase();
        }

        const fetchPosts = async () => {
            setLoading({ ...loading, [temp_topic]: true });

            try {
                const res = await fetch('/api/projects/get?topic=' + temp_topic);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data: ProjectItem[] = await res.json();
                setProjects((prevProjects) => ({
                    ...prevProjects,
                    [temp_topic]: [...(prevProjects[temp_topic] || []), ...data],
                }));
                console.log('data', data);
            } catch (error) {
                console.log('Error fetching projects:', error);
                setError("Something went wrong while fetching projects!");
            } finally {
                setLoading({ ...loading, [temp_topic]: false });
            }
        }

        if (projects[temp_topic] && projects[temp_topic].length > 0) {
            return;
        } else {
            fetchPosts();
        }
    }, [subject]);

    return (
        <div className="flex flex-col w-full">
            {loading[topic] && <div className="flex items-center justify-center mt-8"><Spinner /></div>}
            {error && (
                <div className="p-2 py-3">
                <div className="flex flex-row px-3 py-2.5 rounded-md gap-2 bg-error text-white items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-triangle-alert w-5 h-5 min-h-5 min-w-5 mr-px"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    <p className="text-left text-sm font-medium text-white">{error}</p>
                </div>
                </div>
            )}
            {projects[topic]?.map((project) => (
                <Project key={project.alias} projectData={project} session={session} />
            ))}
        </div>
    )
}