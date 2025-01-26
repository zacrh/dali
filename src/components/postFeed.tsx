

import { useState, useEffect, useRef } from "react";
import { Session } from "next-auth";
import { PostItem } from "@/types/posts";
import { ProjectItem } from "@/types/projects";
import { Spinner } from "./spinner";
import Post from "./post";
import Project from "./project";


type PostFeedProps = {
    session: Session | null;
    subject: string;
  };

export default function PostFeed({ subject, session }: PostFeedProps) {
    const [topic, setTopic] = useState<string>("all");
    const [posts, setPosts] = useState<{ [key: string]: PostItem[] }>({});
    const [projects, setProjects] = useState<{ [key: string]: ProjectItem[] }>({});
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let temp_topic = topic;
        if (subject === "For You") {
            setTopic("all");
            temp_topic = "all";
        } else {
            setTopic(subject.toLowerCase());
            temp_topic = subject.toLowerCase();
        }
        console.log("HELLO", subject, topic, temp_topic);
        console.log("HERE", posts);
        
        const fetchPosts = async ( initial: boolean = false ) => { // initial is true if we're fetching for the first time
            console.log('temp topic', temp_topic);
            setLoading({ ...loading, [temp_topic]: true });
            try {
                const res = await fetch(temp_topic.toLowerCase().includes('projects') ? `/api/projects/get?topic=${temp_topic}` : `/api/posts/get?topic=${temp_topic === 'following' ? 'projects' : temp_topic}`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                if (temp_topic.toLowerCase().includes('projects')) {
                    const data: ProjectItem[] = await res.json();
                    console.log('data projects ', data);
                    setProjects((prevProjects) => ({
                        ...prevProjects, // Preserve existing categories
                        [temp_topic]: [...(!initial ? prevProjects[temp_topic] || [] : []), ...data], // merge existing posts for feed — only if we're loading again (and not for the first time, hence the 'onCache' check, which checks if the current posts in state are from cache or server)
                    }));

                    const recentFeeds = window.sessionStorage.getItem("recentFeeds") || "{}";
                    window.sessionStorage.setItem("recentFeeds", JSON.stringify({ ...JSON.parse(recentFeeds), ["main__" + temp_topic]: data }));
                } else {
                    const data: PostItem[] = await res.json();
                    console.log('data posts ', data);
                    setPosts((prevPosts) => ({
                        ...prevPosts, // Preserve existing categories
                        [temp_topic]: [...(!initial ? (prevPosts[temp_topic] || []) : []), ...data], // merge existing posts for feed — only if we're loading again (and not for the first time, hence the 'onCache' check, which checks if the current posts in state are from cache or server)
                    }));

                    const recentFeeds = window.sessionStorage.getItem("recentFeeds") || "{}";
                    window.sessionStorage.setItem("recentFeeds", JSON.stringify({ ...JSON.parse(recentFeeds), ["main__" + temp_topic]: data }));
                }
                console.log('posts', posts);
            } catch (error) {
                console.log('Error fetching posts:', error);
                setError("Something went wrong while fetching posts!");
            } finally {
                setLoading({ ...loading, [temp_topic]: false });
            }
        };

        const recentFeeds = window.sessionStorage.getItem("recentFeeds") || "{}";
        if (temp_topic.toLowerCase().includes('projects')) {
            if ((projects[temp_topic]) || loading[temp_topic]) {
                return;
            } else {
                fetchPosts(true);
                if (JSON.parse(recentFeeds)["main__" + temp_topic]) {
                    setProjects((prevProjects) => ({
                        ...prevProjects,
                        [temp_topic]: JSON.parse(recentFeeds)["main__" + temp_topic],
                    }));
                    setLoading({ ...loading, [temp_topic]: false });
                }
            }
        } else {
            if ((posts[temp_topic]) || loading[temp_topic]) {
                return;
            } else {
                fetchPosts(true);
                if (JSON.parse(recentFeeds)["main__" + temp_topic]) {
                    setPosts((prevPosts) => ({
                        ...prevPosts,
                        [temp_topic]: JSON.parse(recentFeeds)["main__" + temp_topic],
                    }));
                    setLoading({ ...loading, [temp_topic]: false });
                }
            }
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
            {
                topic.toLowerCase().includes('projects') ? (
                    projects[topic]?.map((project) => (
                        <Project key={project.alias} projectData={project} session={session} />
                    ))
                ) : (
                    posts[topic]?.map((post) => (
                        <Post key={post.id} postData={post} session={session} />
                    ))
                )
            }
            {
                topic.toLowerCase().includes('projects') && projects[topic]?.length === 0 && !loading[topic] && (
                    <div className="flex flex-col items-center justify-center mt-8 gap-1">
                        <h4 className="text-lg font-semibold">No Projects Found</h4>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-500">Feels like there should be tumbleweed here!</p>
                    </div>
                )
            }
            {
                !topic.toLowerCase().includes('projects') && posts[topic]?.length === 0 && !loading[topic] && (
                    <div className="flex flex-col items-center justify-center mt-8 gap-1">
                        <h4 className="text-lg font-semibold">No Posts Found</h4>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-500">Feels like there should be tumbleweed here!</p>
                    </div>
                )
            }
        </div>
    )
}