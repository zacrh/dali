import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PostModal from "./postModal";
import { Project } from "@prisma/client";
import { Session } from "next-auth";

type LeftBarProps = {
    session: Session | null;
}

export default function LeftNav({ session }: LeftBarProps) {
    const [showModal, setShowModal] = useState<boolean>(false);

    const [projects, setProjects] = useState<Project[]>([]);

    const [error, setError] = useState<string>("");
    const pathName = usePathname();

    useEffect(() => {
        console.log(session);

        const fetchUserProjects = async () => {
            if (session?.user?.member) {
                console.log('hello in here')
                fetch(`/api/projects/get?topic=self`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }).then(async (res) => {
                    if (res.status === 200) {
                        const data = await res.json();
                        setProjects(data);
                        // do this to avoid re-fetching the data on every page change (just unnecessary, but b/c this isn't used in the *root* layout, it will rerender every time the middle section content changes (even tho the left side bar persists))
                        window.sessionStorage.setItem("userProjects", JSON.stringify(data)); // also have to make sure to update the session storage when a user joins/creates a project — this is handles in their respective components
                    } else {
                        const { error } = await res.json();
                        setError(error);
                    }
                })
            }
        }

        if (window.sessionStorage.getItem("userProjects")) {
            setProjects(JSON.parse(window.sessionStorage.getItem("userProjects") || ""));
        } else {
            fetchUserProjects();
        }

    }, [session]);

    return (
        <div className="flex flex-col w-1/3 max-w-[250px] h-full p-4">
            <div className="flex flex-col w-full mt-2">
                <div className="flex flex-row gap-2 items-center mb-4 px-3">
                    {session?.user?.image ? <img src={session.user.image} alt="Profile Picture" className="w-11 h-11 rounded-full border-gray-300 dark:border-border" /> : <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-secondary border-gray-300 border dark:border-tertiary" />}
                    <div className="flex flex-col">
                        <h2 className="text-md font-semibold truncate max-w-[150px]">{session?.user?.member?.name.split(" ")[0]}</h2>
                        <p className="text-sm text-gray-600 dark:text-slate-500 truncate max-w-[150px]">{session?.user?.member?.name.split(" ")[1]}</p>
                    </div>
                </div>

                <Link href="/" className="flex flex-row items-center gap-2 hover:bg-gray-50 dark:hover:bg-secondary px-3 py-2 rounded-lg">
                {
                    pathName === "/" ? (
                        <svg fill="none" width="24" viewBox="0 0 24 24" height="24" aria-hidden="true"><path fill="hsl(211, 20%, 95.3%)" fill-rule="evenodd" clip-rule="evenodd" d="M12.63 1.724a1 1 0 0 0-1.26 0l-8 6.5A1 1 0 0 0 3 9v11a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V9a1 1 0 0 0-.37-.776l-8-6.5Z"></path></svg>
                    ) : (
                        <svg fill="none" width="24" viewBox="0 0 24 24" height="24" aria-hidden="true"><path fill="hsl(211, 20%, 95.3%)" fill-rule="evenodd" clip-rule="evenodd" d="M11.37 1.724a1 1 0 0 1 1.26 0l8 6.5A1 1 0 0 1 21 9v11a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-5h-2v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 .37-.776l8-6.5ZM5 9.476V19h4v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5h4V9.476l-7-5.688-7 5.688Z"></path></svg>
                    )
                }
                    <p className={`text-lg ${pathName === "/" ? "font-bold" : "font-medium"}`}>Home</p>
                </Link>

                <Link href={`/projects`} className="flex flex-row items-center gap-2 hover:bg-gray-50 dark:hover:bg-secondary px-3 py-2 rounded-lg">
                    {
                        pathName?.includes(`project`) ? (
                            <svg fill="none" width="24" viewBox="0 0 24 24" height="24" aria-hidden="true"><path fill="hsl(211, 20%, 95.3%)" fill-rule="evenodd" clip-rule="evenodd" d="M9.186 2.512a1.5 1.5 0 0 0-1.674 1.302L7.176 6.5H4a1.5 1.5 0 1 0 0 3h2.8l-.624 5H4a1.5 1.5 0 0 0 0 3h1.8l-.288 2.314a1.5 1.5 0 1 0 2.976.372l.336-2.686h4.977l-.29 2.314a1.5 1.5 0 1 0 2.977.372l.336-2.686H20a1.5 1.5 0 0 0 0-3h-2.8l.624-5H20a1.5 1.5 0 0 0 0-3h-1.8l.288-2.314a1.5 1.5 0 1 0-2.976-.372L15.176 6.5h-4.977l.29-2.314a1.5 1.5 0 0 0-1.303-1.674ZM9.2 14.5l.625-5h4.977l-.625 5H9.199Z"></path></svg>
                        ) : (
                            <svg fill="none" width="24" viewBox="0 0 24 24" height="24" aria-hidden="true"><path fill="hsl(211, 20%, 95.3%)" fill-rule="evenodd" clip-rule="evenodd" d="M9.124 3.008a1 1 0 0 1 .868 1.116L9.632 7h5.985l.39-3.124a1 1 0 0 1 1.985.248L17.632 7H20a1 1 0 1 1 0 2h-2.617l-.75 6H20a1 1 0 1 1 0 2h-3.617l-.39 3.124a1 1 0 1 1-1.985-.248l.36-2.876H8.382l-.39 3.124a1 1 0 1 1-1.985-.248L6.368 17H4a1 1 0 1 1 0-2h2.617l.75-6H4a1 1 0 1 1 0-2h3.617l.39-3.124a1 1 0 0 1 1.117-.868ZM9.383 9l-.75 6h5.984l.75-6H9.383Z"></path></svg>
                        )
                    }
                    <p className={`text-lg ${pathName?.includes(`project`) ? "font-bold" : "font-medium"}`}>Projects</p>
                </Link>

                <Link href={`/profile/${session?.user?.member?.id}`} className="flex flex-row items-center gap-2 hover:bg-gray-50 dark:hover:bg-secondary px-3 py-2 rounded-lg">
                    {
                        pathName === `/profile/${session?.user?.member?.id}` ? (
                            <svg fill="none" width="24" viewBox="0 0 24 24" height="24" aria-hidden="true"><path fill="hsl(211, 20%, 95.3%)" fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm3-12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-3 10a7.976 7.976 0 0 1-5.714-2.4C7.618 16.004 9.605 15 12 15c2.396 0 4.383 1.005 5.714 2.6A7.976 7.976 0 0 1 12 20Z"></path></svg>
                        ) : (
                            <svg fill="none" width="24" viewBox="0 0 24 24" height="24" aria-hidden="true"><path fill="hsl(211, 20%, 95.3%)" fill-rule="evenodd" clip-rule="evenodd" d="M12 4a8 8 0 0 0-5.935 13.365C7.56 15.895 9.612 15 12 15c2.388 0 4.44.894 5.935 2.365A8 8 0 0 0 12 4Zm4.412 14.675C15.298 17.636 13.792 17 12 17c-1.791 0-3.298.636-4.412 1.675A7.96 7.96 0 0 0 12 20a7.96 7.96 0 0 0 4.412-1.325ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10a9.98 9.98 0 0 1-3.462 7.567A9.965 9.965 0 0 1 12 22a9.965 9.965 0 0 1-6.538-2.433A9.98 9.98 0 0 1 2 12Zm10-4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"></path></svg>
                        )
                    }
                    <p className={`text-lg ${pathName === `/profile/${session?.user?.member?.id}` ? "font-bold" : "font-medium"}`}>Profile</p>
                </Link>

                <div className="flex pt-4 pl-3">
                    <button onClick={() => setShowModal(true)} className="flex flex-row items-center gap-2 bg-primary border-primary text-white text-sm font-medium hover:brightness-125 px-4 py-2 items-center justify-center rounded-full border transition-all focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-square-pen h-4 w-4"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                        <p>New Post</p>
                    </button>
                </div>
            </div>    
            {
                // showModal && (
                    <PostModal session={session} projects={projects} showing={showModal} setShowModal={setShowModal} />
                // )
            }
        </div>
    )
}