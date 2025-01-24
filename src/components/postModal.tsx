import { useState, useEffect } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { Project } from "@prisma/client";
import toast from "react-hot-toast";

type PostModalProps = {
    session: Session | null;
    projects: Project[];
    showing: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  };

const MAX_CHARACTERS = 255;

export default function PostModal({session, projects, showing, setShowModal}: PostModalProps) {
    const [textContent, setTextContent] = useState<string>("");
    const [project, setProject] = useState<string>("dalibook");
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    
    const progress = (textContent.length / MAX_CHARACTERS) * 100;
    const radius = 11; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Circumference of the circle
    const offset = circumference - (progress / 100) * circumference; // Offset based on progress

    const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        console.log('projects', projects);
    }, [projects]);

    const toggleDropdown = (id: string) => {
        setDropdownOpen((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));
    }

    const onDropdownItemClick = (project: string) => {
        setProject(project);
        setDropdownOpen({});
    }


    const onPostClick = () => {
      // make the post
        setLoading(true);
      fetch(`/api/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: textContent,
          projectAlias: project,
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          const data = await res.json();
          setSuccess(true);
          setShowModal(false);
          toast.success("Posted!");
          console.log(data);
        } else {
          const { error } = await res.json();
          console.log(error);
        }
      });
    }
    


    // useEffect(() => {
    //     if (showModal) {
    //         document.body.style.overflow = "hidden";
    //     } else {
    //         document.body.style.overflow = "auto";
    //     }
    // }, [showModal]);

    return (
        <div className={`fixed inset-0 z-10 transition-opacity duration-200 ${
            showing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className={`fixed inset-0 bg-black/75 transition-opacity duration-200 ${
      showing ? "opacity-100" : "opacity-0"
    }`}
 aria-hidden="true"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className={`relative transform transition-all duration-200 ${
        showing ? "scale-100 opacity-100" : "scale-95 opacity-0"
      } rounded-lg bg-white dark:bg-background border border-gray-300 dark:border-border shadow-xl sm:w-full sm:max-w-lg`}
>
                        <div className="flex flex-row justify-between items-center px-2 py-2">
                            <button className="px-2 py-1 text-primary rounded-full hover:bg-primaryhover text-sm font-medium" onClick={() => {setShowModal(false)}}>
                                Cancel
                            </button>
                            <button className={`px-3 py-1 text-white rounded-full bg-primary hover:brightness-125 text-sm font-medium ${(textContent.length === 0 || textContent.length > MAX_CHARACTERS || loading) && 'opacity-80 cursor-not-allowed hover:brightness-100'}`} onClick={() => {onPostClick()}} disabled={textContent.length === 0 || textContent.length > MAX_CHARACTERS || loading}>
                                {loading ? "Posting..." : "Post"}
                            </button>
                        </div>
                        <div className="flex flex-row gap-4 p-3 pt-0">
                            <div className="w-1/12">
                            {session?.user?.image ? <img src={session.user.image} alt="Profile Picture" className="w-11 h-11 rounded-full border-gray-300 dark:border-border" /> : <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-secondary border-gray-300 border dark:border-tertiary" />}
                            </div>
                            <textarea placeholder="What are you working on?" maxLength={MAX_CHARACTERS} className="w-11/12 h-32 text-lg resize-none bg-white dark:bg-background border-0 font-medium outline-none border-none outline-none focus:outline-none focus:border-none focus:ring-0" value={textContent} onChange={(e) => setTextContent(e.target.value)} />
                        </div>
                        <div className="flex flex-row justify-between items-center px-2 py-1 border-t border-gray-300 dark:border-border">
                            <div className="relative">
                             <div id="project-dropdown" className={`z-10 ${dropdownOpen["project"] ? 'absolute' : 'hidden'} p-1 bottom-10 w-32 rounded-md border border-gray-300 dark:border-border dark:bg-secondary shadow`} onBlur={() => setDropdownOpen({})}>
                                    <ul aria-labelledby="dropdownProjectButton" className="divide-y divide-border text-sm text-gray-700 dark:text-gray-200 overflow-scroll max-h-32">
                                        {
                                            projects.map((project) => ( project.alias !== "dalibook" &&
                                                <li key={project.alias} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={() => onDropdownItemClick(project.alias)}>
                                                    
                                                    
                                                    <p className="cursor-pointer flex items-center rounded w-full px-2 py-1 gap-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">
                                                        <span className="p-1 rounded-full bg-gray-200 dark:bg-primaryhover text-primary">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hash w-4 h-4"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                                                        </span>
                                                        {project.alias}
                                                    </p>
                                                </li>
                                            ))
                                        }
                                        <li key={"dalibook"} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={() => onDropdownItemClick("dalibook")}>
                                            <p className="cursor-pointer flex items-center rounded w-full px-2 py-1 gap-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">
                                                <span className="p-1 rounded-full bg-gray-200 dark:bg-primaryhover text-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hash w-4 h-4"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                                                </span>
                                                dalibook
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                                <button className="px-2 py-1 text-primary rounded-full hover:bg-primaryhover text-sm font-medium flex flex-row gap-1 items-center" onClick={() => toggleDropdown("project")}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hash w-4 h-4"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                                    {/* {project === "dalibook" ? <p className="text-sm font-medium text-gray-400 dark:text-slate-400">Project</p> : <p className="text-sm font-medium text-gray-400 dark:text-slate-400">{project}</p>} */}
                                    {project === "dalibook" ? "dalibook" : <p className="text-sm font-medium text-gray-400 dark:text-slate-400">{project}</p>}
                                </button>
                                
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <p className="text-sm">{MAX_CHARACTERS - textContent.length}</p>
                                <div className="relative w-8 h-8">
                                    {/* Background Circle */}
                                    <svg className="transform rotate-90" width="32" height="32">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r={radius}
                                        fill="transparent"
                                        stroke="#2E4152"
                                        strokeWidth="2"

                                    />
                                    </svg>

                                    {/* Progress Circle */}
                                    <svg className="absolute top-0 left-0 transform rotate-90" width="32" height="32">
                                    <circle
                                        cx="16"
                                        cy="16"
                                        r={radius}
                                        fill="transparent"
                                        stroke="#3F69AD"
                                        strokeWidth="2"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        className="transition-stroke-dashoffset duration-300"
                                    />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    )
};