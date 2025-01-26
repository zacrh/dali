import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { Project } from "@prisma/client";
import { WorkingProject } from "@/types/projects";
import toast from "react-hot-toast";
import { useRouter } from 'next/router'

type ProjectModalProps = {
    session: Session | null;
    showing: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  };

const MAX_CHARACTERS = 255;

export default function ProjectModal({ session, showing, setShowModal }: ProjectModalProps) {
    const [projectData, setProjectData] = useState<WorkingProject | null>({ name: "", alias: "", description: "", picture: null, ownerId: session?.user.member.id });

    const [textContent, setTextContent] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [saveDisabled, setSaveDisabled] = useState<boolean>(false);
    const [takenAliases, setTakenAliases] = useState<string[]>([]);
    
    const progress = (textContent.length / MAX_CHARACTERS) * 100;
    const radius = 11; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Circumference of the circle
    const offset = circumference - (progress / 100) * circumference; // Offset based on progress

    const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
    const router = useRouter();


    const toggleDropdown = (id: string) => {
        setDropdownOpen((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));
    }

    const onDropdownItemClick = (project: string) => {
        setDropdownOpen({});
    }

    const onCreateClick = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saveDisabled) {
            return;
        }
        setError("");
        setLoading(true);
        console.log("p data", projectData);

        fetch("/api/projects/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(projectData),
          }).then(async (res) => {
            setLoading(false);

            if (res.status === 200) {
                const data = await res.json();
                const created = data.created;
                const newProject = data.project;
                if (!created) {
                    setError("Failed to create project");
                    return;
                }

                if (window.sessionStorage.getItem("userProjects")) {
                    const userProjects = JSON.parse(window.sessionStorage.getItem("userProjects")!);
                    window.sessionStorage.setItem("userProjects", JSON.stringify([...userProjects, newProject]));
                }

                setSuccess(true);
                setShowModal(false);
                toast.success(`Created #${newProject.alias}`);
                router.push(`/project/${newProject.alias}`);
                console.log('created project')
            } else {
                const { error } = await res.json();
                setError(error);
            }
          });

        console.log('created project')
    }


    return (
        <div className={`fixed inset-0 z-10 transition-opacity duration-200 ${
            showing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`} aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={() => {setShowModal(false)}}>
            <div  className={`fixed inset-0 bg-black/75 transition-opacity duration-200 ${
      showing ? "opacity-100" : "opacity-0"
    }`}
 aria-hidden="true"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto"  >
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" >
                    <div onClick={(e) => e.stopPropagation()} className={`relative transform transition-all duration-200 ${
        showing ? "scale-100 opacity-100" : "scale-95 opacity-0"
      } rounded-lg bg-white dark:bg-background border border-gray-300 dark:border-border  shadow-xl sm:w-full sm:max-w-lg`}
>
                        <div className="flex flex-row justify-between items-center px-4 pr-2.5 py-2">
                            <p className="text-md font-semibold">Create a New Project</p>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-secondary">
                                <svg fill="none" width="20" viewBox="0 0 24 24" height="20" className="h-5 w-5"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L12 10.586l6.293-6.293a1 1 0 1 1 1.414 1.414L13.414 12l6.293 6.293a1 1 0 0 1-1.414 1.414L12 13.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L10.586 12 4.293 5.707a1 1 0 0 1 0-1.414Z"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={(e) => onCreateClick(e)}>
                        <div className="flex flex-col gap-4 px-4 p-3 w-full pt-0">
                        <div>
                            <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-600 dark:text-slate-400 text-left"
                            >
                            Name <span className="text-error">*</span>
                            </label>
                            <input
                            id="name"
                            name="name"
                            type="name"
                            placeholder="The Dalibook"
                            autoComplete="off"
                            onChange={(e) => setProjectData((prev) => prev ? ({ ...prev, name: e.target.value }) : null)}
                            required
                            className={`mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm`}
                            />
                        </div>
                        <div>
                            <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-600 dark:text-slate-400 text-left"
                            >
                            Alias <span className="text-error">*</span>
                            </label>
                            <input
                            id="alias"
                            name="alias"
                            type="alias"
                            placeholder="dalibook"
                            autoComplete="off"
                            maxLength={16}
                            onChange={(e) => setProjectData((prev) => prev ? ({ ...prev, alias: e.target.value }) : null)}
                            required
                            className={`mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm`}
                            />
                        </div>
                        <div>
                            <div className="flex flex-row items-center justify-between">
                            <label
                            htmlFor="email"
                            className=" text-sm font-medium text-gray-600 dark:text-slate-400 text-left"
                            >
                            Description
                            </label>
                            <p className={`text-xs ${projectData?.description?.length === 255 ? "text-error" : "text-gray-400 dark:text-slate-400"}`}>{projectData?.description?.length}/{255}</p>
                            </div>
                            <textarea
                            id="description"
                            name="description"
                            placeholder="The Dalibook is a place for members of the DALI Lab to share how their projects are going, and stay in the loop with what other members are working on."
                            autoComplete="off"
                            maxLength={255}
                            onChange={(e) => setProjectData((prev) => prev ? ({ ...prev, description: e.target.value }) : null)}
                            className={`mt-1 block w-full h-24 resize-none appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm`}
                            />
                        </div>
                        </div>
                        <div className="flex flex-row justify-end gap-2 items-center px-4 py-2.5 border-t border-gray-300 dark:border-border mt-1">

                            <button onClick={() => setShowModal(false)} className="flex flex-row items-center gap-1 px-3.5 py-2 text-sm font-medium text-gray-300 dark:text-slate-400 rounded-md bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-tertiary transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className={`flex flex-row items-center gap-1 px-3.5 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-sky-700 to-primary transition-all ${saveDisabled || loading ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:brightness-110"}`}>
                                {
                                    loading ? (
                                        "Saving..."
                                    ) : (
                                        "Save Project"
                                    )
                                }
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
    )
};