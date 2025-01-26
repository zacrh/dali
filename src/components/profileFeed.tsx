import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from 'next/router'
import { usePreviousRoute } from "../context/PreviousRouteProvider";
import { MemberItem } from "@/types/members";
import { Spinner } from "./spinner";
import { toast } from "react-hot-toast";
import PostFeed from "./postFeed";

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

type ProfileFeedProps = {
    memberId: number;
}


export default function ProfileFeed({ memberId }: ProfileFeedProps) {
    const { data: session, status } = useSession();
    const [currentFeed, setCurrentFeed] = useState<"Posts"|"Projects">("Posts");
    const [member, setMember] = useState<MemberItem | null>(null);
    const [attributes, setAttributes] = useState<{ [key: string]: string}>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);
    const router = useRouter();
    const previousRoute = usePreviousRoute();

    const onFeedClick = (feed: "Posts"|"Projects") => {
        setCurrentFeed(feed);
    }

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);;
            try {
                const res = await fetch(`/api/members/${memberId}/get`);
                if (!res.ok)  {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                console.log("Member data:", data);
                setMember(data);
                const newAttributes: { [key: string]: string } = {};
                for (const attribute of data.attributes) {
                    newAttributes[attribute.name] = attribute.value;
                }
                setAttributes(newAttributes);

                const recentProfiles = window.sessionStorage.getItem("recentProfiles") || "{}";
                window.sessionStorage.setItem("recentProfiles", JSON.stringify({ ...JSON.parse(recentProfiles), [memberId]: data }));
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Something went wrong while fetching profile!");
            } finally {
                setLoading(false);
            }
        }

        if (!Number.isNaN(memberId)) {
            fetchProfile();
            const recentProfiles = window.sessionStorage.getItem("recentProfiles") || "{}";
            if (JSON.parse(recentProfiles)[memberId]) {
                const cachedMember = JSON.parse(recentProfiles)[memberId];
                setMember(cachedMember);
                const newAttributes: { [key: string]: string } = {};
                for (const attribute of cachedMember.attributes) {
                    newAttributes[attribute.name] = attribute.value;
                }
                setAttributes(newAttributes);
                setLoading(false);
            }
        }
    }, [memberId])

    const onBackClick = () => {
        // check if prev page is this website, if not go to home
        if (previousRoute && previousRoute.startsWith("/")) {
            router.push(previousRoute); // go to previous route if it's on dalibook website
        } else {
            router.push("/"); // go home if external
        }
    }

    const onMoreClick = () => {
        setMoreDropdownOpen(!moreDropdownOpen);
    }

    const onCopyClick = () => {
        // copy to clipboard
        navigator.clipboard.writeText("https://dali.0z.gg/profile/" + memberId);
        toast.success("Copied to clipboard!");
        setMoreDropdownOpen(false);
    }

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
                {member && (
            <div className="flex flex-col w-full">
                <div className="flex flex-col w-full">
                    <div className="flex h-[150px] w-full border-b border-background bg-gradient-to-r from-primaryhover to-primary p-4">
                        <button onClick={() => onBackClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                            <svg fill="none" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5"><path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z"></path></svg>
                        </button>
                    </div>
                    <div className="flex flex-row w-full justify-between px-4 h-max  -translate-y-[50%] -mb-10">
                        {
                            member?.picture ? (
                                <Image
                                    src={member.picture}
                                    alt="Avatar"
                                    className="w-24 h-24 object-cover border-2 border-background rounded-full"
                                    width={500}
                                    height={500}
                                />
                            ) : (
                                <svg className="w-24 h-24 rounded-full bg-gray-200 dark:bg-secondary border-2 border-background" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="none" data-testid="userAvatarFallback"><circle cx="12" cy="12" r="12" fill="#3F69AD"></circle><circle cx="12" cy="9.5" r="3.5" fill="#fff"></circle><path stroke-linecap="round" stroke-linejoin="round" fill="#fff" d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"></path></svg>
                            )
                        }
                        <div className="flex flex-row items-end gap-2 py-2 ">
                            <div className="relative">
                                <button onClick={() => onMoreClick()} className="flex items-center justify-center p-1.5 rounded-full text-white w-max h-max bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                                    <svg fill="none" width="16" viewBox="0 0 24 24" height="16" className="w-5 h-5"><path fill="hsl(211, 20%, 73.6%)" fill-rule="evenodd" clip-rule="evenodd" d="M2 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm16 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path></svg>
                                </button>
                                <div id="more-dropdown" className={`z-10 -translate-y-[4px] opacity-0 absolute ${moreDropdownOpen ? 'translate-y-0 opacity-100' : 'invisible'} transition-all duration-200 p-1 w-36 rounded-md mt-1 right-0 border border-gray-300 dark:border-border dark:bg-secondary shadow`} onBlur={() => setMoreDropdownOpen(false)}>
                                        <ul aria-labelledby="dropdownMoreButton" className="divide-y divide-border text-sm text-gray-700 dark:text-gray-200 overflow-scroll max-h-32">
                                            <li key={"link"} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopyClick() } }>
                                                <p className="cursor-pointer flex items-center rounded w-full px-2 py-1 gap-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">
                                                    <span className="rounded-full text-gray-400 dark:text-slate-400 ">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-share w-4 h-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                                                    </span>
                                                    Share Profile
                                                </p>
                                            </li>
                                            {/* <li key={"text"} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopyClick(post.id, "text") } }>
                                                <p className="cursor-pointer flex items-center rounded w-full px-2 py-1 gap-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">
                                                    <span className="rounded-full text-gray-400 dark:text-slate-400 ">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-copy w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                                    </span>
                                                    Copy Text
                                                </p>
                                            </li> */}
                                        </ul>
                                    </div>
                                    </div>
                            </div>
                    </div>
                    <div className="flex flex-col px-4 gap-1">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold">{member?.name}</h2>
                            <p className="text-sm font-medium text-gray-600 dark:text-slate-500">{member?.home} <span className="mx-0.5 font-semibold">·</span> {member?.year.length === 2 ? "GR" : "'" + member?.year.slice(-2)}</p>
                        </div>
                        <div className="flex flex-row gap-2 w-full">
                            {member?.roles.map((role) => (
                                <div key={role.role.alias} className="px-1.5 py-0.5 text-primary rounded-full bg-primaryhover text-xs font-medium flex flex-row gap-1 items-center">
                                    {role.role.name}
                                </div>
                            ))}
                            <div key={'studies'} className="px-1.5 py-0.5 text-gray-600 dark:text-slate-500 rounded-full bg-secondary text-xs font-medium flex flex-row gap-1 items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-library w-3 h-3"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
                                {member?.major} {member?.minor && " · " + member?.minor}
                            </div>
                            <div key={'birthday'} className="px-1.5 py-0.5 text-gray-600 dark:text-slate-500 rounded-full bg-secondary text-xs font-medium flex flex-row gap-1 items-center">
                                <svg fill="none" width="28" viewBox="0 0 24 24" height="28" className="w-3 h-3"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="m12 .757 2.122 2.122A3 3 0 0 1 13 7.829V9h4.5a3 3 0 0 1 3 3v1.646c0 .603-.18 1.177-.5 1.658V19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3.696a3 3 0 0 1-.5-1.658V12a3 3 0 0 1 3-3H11V7.829a3 3 0 0 1-1.121-4.95L12 .757ZM6.5 11a1 1 0 0 0-1 1v1.646a1 1 0 0 0 .629.928l.5.2a1 1 0 0 0 .742 0l1.015-.405a3 3 0 0 1 2.228 0l1.015.405a1 1 0 0 0 .742 0l1.015-.405a3 3 0 0 1 2.228 0l1.015.405a1 1 0 0 0 .742 0l.5-.2a1 1 0 0 0 .629-.928V12a1 1 0 0 0-1-1h-11ZM6 16.674V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2.326a3 3 0 0 1-2.114-.043l-1.015-.405a1 1 0 0 0-.742 0l-1.015.405a3 3 0 0 1-2.228 0l-1.015-.405a1 1 0 0 0-.742 0l-1.015.405A3 3 0 0 1 6 16.674ZM12.002 6a1 1 0 0 0 .706-1.707L12 3.586l-.707.707A1 1 0 0 0 12.002 6Z"></path></svg>
                                {months[parseInt(member?.birthday.split("-")[0] as string)]}, {parseInt(member?.birthday.split("-")[1] as string)}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row px-4 gap-2 mt-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-500 flex gap-1"><span className="text-foreground font-semibold">{member?._count.posts}</span>Posts</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-500 flex gap-1"><span className="text-foreground font-semibold">{member?._count.projects + member?._count.projectsOwned}</span>Project{member?._count.projects + member?._count.projectsOwned === 1 ? '' : 's'}</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-500 flex gap-1"><span className="text-foreground font-semibold">{member?._count.postLikes}</span>Likes</p>
                    </div>
                    <div className="flex flex-col px-4 gap-2 mt-2">
                        {
                            attributes['favorite thing 1'] && (
                                <div className="flex flex-row gap-2 items-start">
                                    <div className="flex flex-row gap-1 items-center w-max">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-star w-4 h-4 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                                        <p className="text-sm font-medium text-gray-600 dark:text-slate-500 w-max">Favorite Things</p>
                                    </div>
                                    <p className="text-sm font-medium truncate">{attributes['favorite thing 1']}, {attributes['favorite thing 2']}, and {attributes['favorite thing 3']}</p>
                                </div>
                            )
                        }
                        {
                            attributes['fun fact'] && (
                                <div className="flex flex-row gap-2 items-start">
                                    <div className="flex flex-row gap-1 items-center w-max">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-info w-4 h-4 text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                        <p className="text-sm font-medium text-gray-600 dark:text-slate-500 w-max">Fun Fact</p>
                                    </div>
                                    <p className="text-sm font-medium truncate">{attributes['fun fact']}</p>
                                </div>
                            )
                        }
                        {
                            attributes['favorite dartmouth tradition'] && (
                                <div className="flex flex-row gap-2 items-start">
                                    <div className="flex flex-row gap-1 items-center w-max">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-flame-kindling w-4 h-4 text-primary"><path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z"/><path d="m5 22 14-4"/><path d="m5 18 14 4"/></svg>
                                        <p className="text-sm font-medium text-gray-600 dark:text-slate-500 w-max">Dartmouth Tradition</p>
                                    </div>
                                    <p className="text-sm font-medium truncate">{attributes['favorite dartmouth tradition']}</p>
                                </div>
                            )
                        }
                        {
                            attributes['quote'] && (
                                <div className="flex flex-row gap-2 items-start">
                                    <div className="flex flex-row gap-1 items-center w-max">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-quote w-4 h-4 text-primary"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>
                                        <p className="text-sm font-medium text-gray-600 dark:text-slate-500 w-max">Quote</p>
                                    </div>
                                    <p className="text-sm font-medium truncate">{attributes['quote']}</p>
                                </div>
                            )
                        }
                        
                       
                    </div>

                    <div className="flex flex-row w-full border-b border-gray-200 dark:border-tertiary mt-4">
                        <div className="w-1/2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onFeedClick("Posts")}>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-md font-semibold py-1.5 pt-3">Posts</p>
                                <div className={`w-1/2 h-[3px] bg-primary rounded-t-lg ${currentFeed !== "Posts" && 'translate-y-[100%]'} transition-transform duration-100`} />
                            </div>
                        </div>
                        <div className="w-1/2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-secondary transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onFeedClick("Projects")}>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-md font-semibold py-1.5 pt-3">Projects</p>
                                <div className={`w-1/2 h-[3px] bg-primary rounded-t-lg ${currentFeed !== "Projects" && 'translate-y-[100%]'} transition-transform duration-100`} />
                            </div>
                        </div>
                    </div>
                </div>
                    {
                        <PostFeed subject={`profile__${memberId}__${currentFeed.toLowerCase()}`} session={session} />
                    }
                
            </div>
                )}
        </div>
    )
}