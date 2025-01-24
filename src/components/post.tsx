import { useState, useEffect, useRef } from "react";
import { Session } from "next-auth";
import { PostItem } from "@/types/posts";
import Link from "next/link";
import Image from "next/image";
import { formatReadableDate, timeAgo } from "@/lib/utils";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Tooltip from "./tooltip";

type PostProps = {
    postData: PostItem;
    session: Session | null;
};

export default function Post({ postData, session }: PostProps) {
    const [post, setPost] = useState<PostItem>(postData);
    const [liked, setLiked] = useState(post.likes.some((like) => like.memberId === session?.user.member.id));
    const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const debounceRef = useRef<NodeJS.Timeout | null>(null); // debounce timer -- used to delay like requests (so people don't spam the server!)

    const onMoreClick = (postId: string) => {
        setMoreDropdownOpen(!moreDropdownOpen);
    }

    const onCopyClick = (postId: string, type: "link"|"text") => {
        console.log('copy clicked', postId, type);

        // copy to clipboard
        if (type === "link") navigator.clipboard.writeText("https://dali.0z.gg/post/" + postId);
        if (type === "text") {
            const content = post.content;
            if (content) navigator.clipboard.writeText(content);
        };

        toast.success(`Copied ${type} to clipboard!`);

        setMoreDropdownOpen(false);
    }

    const onLikeClick = async (postId: string) => {
        if (!session?.user.member.id) {
          router.push("/login");
          return;
        }
  
        // update like count of the post in the state first, so that the UI updates immediately — then send the request
        const userId = session.user.member.id;

        setPost((prevPost) => {
            if (liked) {
              // User already liked, so remove the like
              setLiked(false);
              return {
                ...prevPost,
                _count: {
                  likes: prevPost._count.likes - 1,
                },
                likes: prevPost.likes.filter((like) => like.memberId !== userId),
              };
            } else {
              // User hasn't liked, so add the like
              setLiked(true);
              return {
                ...prevPost,
                _count: {
                  likes: prevPost._count.likes + 1,
                },
                likes: [...prevPost.likes, { memberId: userId }],
              };
            }
        })

        // clearing prev timer so we still only send one request
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
  
        // debounce/set a new timer
        debounceRef.current = setTimeout(async () => {
          try {
            const res = await fetch(`/api/posts/like/${postId}`, {
              method: !liked ? "POST" : "DELETE", // has to be the opposite b/c of the optimistic UI update i think
              headers: {
                "Content-Type": "application/json",
              },
            });
  
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
  
            const data = await res.json();
            console.log("data", data);
          } catch (error) {
            console.log("Error liking post:", error);
            setError("Something went wrong while liking/unliking the post!");
          }
        }, 2000); // wait a few seconds before sending the request to catch any changes
      }

    return(
        <Link key={post.id} href={`/project/${post.projectId ? post.project.alias : 'dalibook'}`} className="flex flex-row w-full border-b py-3 px-4 border-gray-200 dark:border-tertiary gap-3 hover:bg-gray-100 dark:hover:bg-posthover transition-colors">
                    <Link href={`/profile/${post.author.id}`} className="h-max">
                        {post.author.picture ? (
                            <Image
                                src={post.author.picture}
                                alt="Avatar"
                                className="w-10 rounded-full border border-gray-300 dark:border-tertiary"
                                width={100}
                                height={100}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary" />
                        )}
                    </Link>
                    <div className="flex flex-col pt-0.5 w-full">
                        <div className="flex flex-row items-center justify-between w-full">
                            <Link href={`/profile/${post.author.id}`} className="flex flex-row items-center gap-2">
                                <h2 className="text-md font-semibold">{post.author.name}</h2>
                                {
                                    post.author.roles?.map((role) => (
                                        <div className="px-1.5 py-0.5 text-primary rounded-full bg-primaryhover text-xs font-medium flex flex-row gap-1 items-center">
                                            {role.role.name}
                                        </div>
                                    ))
                                }
                                <Tooltip content={formatReadableDate(post.createdAt)}>
                                <p className="text-sm text-gray-600 dark:text-slate-500">{timeAgo(post.createdAt)}</p>
                                </Tooltip>
                            </Link>
                            <div className="relative">
                                <div className="flex items-center justify-center rounded-full p-1 hover:bg-gray-100 dark:hover:bg-tertiary transition-all duration-200 color-gray-400 dark:text-slate-400" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoreClick(post.id) }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-ellipsis w-4 h-4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                </div>
                                <div id="more-dropdown" className={`z-10 ${moreDropdownOpen ? 'absolute' : 'hidden'} p-1 w-32 rounded-md mt-1 right-0 border border-gray-300 dark:border-border dark:bg-secondary shadow`} onBlur={() => setMoreDropdownOpen(false)}>
                                    <ul aria-labelledby="dropdownMoreButton" className="divide-y divide-border text-sm text-gray-700 dark:text-gray-200 overflow-scroll max-h-32">
                                        <li key={"link"} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopyClick(post.id, "link") } }>
                                            <p className="cursor-pointer flex items-center rounded w-full px-2 py-1 gap-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">
                                                <span className="rounded-full text-gray-400 dark:text-slate-400 ">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-link w-4 h-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                                </span>
                                                Copy Link
                                            </p>
                                        </li>
                                        <li key={"text"} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopyClick(post.id, "text") } }>
                                            <p className="cursor-pointer flex items-center rounded w-full px-2 py-1 gap-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">
                                                <span className="rounded-full text-gray-400 dark:text-slate-400 ">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-copy w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                </span>
                                                Copy Text
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className="text-md whitespace-pre-wrap">{post.content}</p>
                        <div className="flex flex-row gap-2 mt-2">
                            {
                                post.project.alias !== "dalibook" && (
                                    <Link href={`/project/${post.project.alias}`} className="text-primary rounded-full text-sm font-medium flex flex-row gap-1 items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hash w-4 h-4"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                                        {/* {project === "dalibook" ? <p className="text-sm font-medium text-gray-400 dark:text-slate-400">Project</p> : <p className="text-sm font-medium text-gray-400 dark:text-slate-400">{project}</p>} */}
                                        <p className="text-sm font-medium text-gray-400 dark:text-slate-400">{post.project.alias}</p>
                                    </Link>
                                )
                            }

                            <div className="flex flex-row gap-2 items-center">
                            <div className={`flex flex-row gap-1.5 text-sm font-medium flex flex-row gap-1 items-center rounded-full px-2 py-1 transition-all duration-100 ${liked ? 'text-like dark:text-like hover:bg-likehover' : 'text-gray-400 dark:text-slate-400 hover:bg-primaryhover'}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLikeClick(post.id); }}>
                                {
                                    liked ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-rocket w-4 h-4">
                                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                                            
                                            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="currentColor"/>
                                            
                                            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" fill="currentColor"/>
                                            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill="currentColor"/>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-rocket w-4 h-4"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                                    )
                                }
                                <p className={`text-sm font-medium ${liked ? 'text-like dark:text-like' : 'text-gray-400 dark:text-slate-400'}`}>{post._count.likes} Like{post._count.likes === 1 ? '' : 's'}</p>
                            </div>
                            </div>
                            

                        </div>
                    </div>
                </Link>
    )
}