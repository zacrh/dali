import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { PostItem } from "@/types/posts";
import { ProjectItem } from "@/types/projects";
import { Spinner } from "./spinner";
import Post from "./post";
import Project from "./project";
import { MemberItem } from "@/types/members";
import Member from "./member";


type PostFeedProps = {
    session: Session | null;
    subject: string;
    projectAlias: string;
  };

export default function ProjectDualFeed({ subject, projectAlias, session }: PostFeedProps) {
    const [topic, setTopic] = useState<string>("posts");
    const [posts, setPosts] = useState<PostItem[]|null>(null);
    const [people, setPeople] = useState<MemberItem[]|null>(null);
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let temp_topic = topic;
        setTopic(subject.toLowerCase());
        temp_topic = subject.toLowerCase();

        console.log("HELLO", subject, topic, temp_topic);
        
        const fetchPosts = async () => {
            console.log('temp topic', temp_topic);
            setLoading({ ...loading, [temp_topic]: true });
            try {
                const res = await fetch(temp_topic.toLowerCase().includes('people') ? `/api/projects/${projectAlias}/members/get` : `/api/projects/${projectAlias}/posts/get`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                if (temp_topic.toLowerCase().includes('people')) {
                    const data: MemberItem[] = await res.json();
                    console.log('data projects ', data);
                    setPeople((prevPeople) => ([
                        ...(prevPeople || []),
                        ...data,
                    ]));
                } else {
                    const data: PostItem[] = await res.json();
                    console.log('data posts ', data);
                    setPosts((prevPosts) => ([
                        ...(prevPosts || []), // Preserve existing categories
                        ...data, // Merge existing and new posts for this category
                    ]));
                }
                console.log('posts', posts);
            } catch (error) {
                console.log('Error fetching posts:', error);
                setError("Something went wrong while fetching posts!");
            } finally {
                setLoading({ ...loading, [temp_topic]: false });
            }
        };

        if (temp_topic.toLowerCase().includes('posts')) {
            if (posts || loading[temp_topic]) {
                return;
            } else {
                fetchPosts();
            }
        } else {
            if (people || loading[temp_topic]) {
                return;
            } else {
                fetchPosts();
            }
        }

    }, [subject]);

    return (
        <div className="flex flex-col w-full pb-36">
            {loading[topic] && <div className="flex items-center justify-center mt-8"><Spinner /></div>}
            {error && (
                <div className="p-2 py-3">
                <div className="flex flex-row px-3 py-2.5 rounded-md gap-2 bg-error text-white items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-triangle-alert w-5 h-5 min-h-5 min-w-5 mr-px"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    <p className="text-left text-sm font-medium text-white">{error}</p>
                </div>
                </div>
            )}
            {topic.toLowerCase().includes('posts') ? (
                posts?.map((post) => (
                    <Post key={post.id} postData={post} session={session} />
                ))
            ) : (
                people?.map((person) => (
                    <Member memberData={person} session={session} />
                ))
            )}
        </div>
    )
}