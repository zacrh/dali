import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Session } from "next-auth";
import toast from "react-hot-toast";
import { MemberItem } from "@/types/members";
import Tooltip from "./tooltip";

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

type MemberProps = {
    memberData: MemberItem;
    session: Session | null;
    owner?: boolean
};

export default function Member({ memberData, session, owner = false }: MemberProps) {
    const [member, setMember] = useState<MemberItem>(memberData);
    const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
    const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        if (Object.keys(attributes).length === 0 && memberData.attributes) {
            const newAttributes: { [key: string]: string } = {};
            for (const attribute of memberData.attributes) {
                newAttributes[attribute.name] = attribute.value;
            }
            setAttributes(newAttributes);
        }
    }, [memberData])

    const onMoreClick = () => {
        setMoreDropdownOpen(!moreDropdownOpen);
    }

    const onCopyClick = (memberId: number, type: "link"|"text") => {
        console.log('copy clicked', memberId, type);

        // copy to clipboard
        if (type === "link") navigator.clipboard.writeText("https://dali.0z.gg/profile/" + memberId);

        toast.success(`Copied profile to clipboard!`);

        setMoreDropdownOpen(false);
    }

    return (
        <Link key={member.id} href={`/profile/${member.id}`} className="flex flex-row w-full border-b py-3 px-4 border-gray-200 dark:border-tertiary gap-3 hover:bg-gray-100 dark:hover:bg-posthover transition-colors">
            <div className="h-max min-w-max">
                {member.picture ? (
                    <Image
                        src={member.picture}
                        alt="Avatar"
                        className="w-10 h-10 object-cover rounded-full bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary"
                        width={40}
                        height={40}
                    />
                ) : (
                    <svg className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary border border-gray-300 dark:border-tertiary" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="none" data-testid="userAvatarFallback"><circle cx="12" cy="12" r="12" fill="#3F69AD"></circle><circle cx="12" cy="9.5" r="3.5" fill="#fff"></circle><path stroke-linecap="round" stroke-linejoin="round" fill="#fff" d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"></path></svg>
                )}
            </div>
            <div className="flex flex-col w-full">
                <div className="flex flex-row items-center justify-between w-full -mt-px">
                    <div className="flex flex-row items-center gap-1">
                        <h2 className="text-md font-semibold">{member.name}</h2>
                        {
                            member.roles?.map((role) => (
                                <div key={role.role.alias} className="px-1.5 py-0.5 text-primary rounded-full bg-primaryhover text-xs font-medium flex flex-row gap-1 items-center">
                                    {role.role.name}
                                </div>
                            ))
                        }
                        {
                            owner && (
                                <div className="px-1.5 py-0.5 text-red-500 rounded-full bg-red-500/10 text-xs font-medium flex flex-row gap-1 items-center">
                                    Owner
                                </div>
                            )
                        }
                    </div>
                    <div className="relative">
                        <div className="flex items-center justify-center rounded-full p-1 hover:bg-gray-100 dark:hover:bg-tertiary transition-all duration-200 color-gray-400 dark:text-slate-400" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoreClick() }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-ellipsis w-4 h-4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </div>
                        <div id="more-dropdown" className={`z-10 -translate-y-[4px] opacity-0 absolute ${moreDropdownOpen ? 'translate-y-0 opacity-100' : 'invisible'} transition-all duration-200 p-1 w-36 rounded-md mt-1 right-0 border border-gray-300 dark:border-border dark:bg-secondary shadow`} onBlur={() => setMoreDropdownOpen(false)}>
                            <ul aria-labelledby="dropdownMoreButton" className="divide-y divide-border text-sm text-gray-700 dark:text-gray-200 overflow-scroll max-h-32">
                                <li key={"link"} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCopyClick(member.id, "link") } }>
                                    <p className="cursor-pointer flex items-center rounded w-full px-2 py-1 gap-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">
                                        <span className="rounded-full text-gray-400 dark:text-slate-400 ">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-link w-4 h-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                        </span>
                                        Copy Profile
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-500">{member.home} <span className="mx-px font-semibold">·</span> {member?.year.length === 2 ? "GR" : "'" + member?.year.slice(-2)}</p>
                <div className="flex flex-col gap-1 my-2 pr-4">
                        {
                            attributes['favorite thing 1'] && (
                                <Tooltip content="Favorite Thing">
                                    <div className="flex flex-row gap-2 items-center max-w-[500px]">
                                <div className="flex flex-row gap-1 items-center w-max">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-star w-4 h-4 text-primary"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                                        </div>
                                <p className="text-sm font-medium truncate">{attributes['favorite thing 1']}, {attributes['favorite thing 2']}, and {attributes['favorite thing 3']}</p>
                                    </div>
                                    </Tooltip>
                            )
                        }
                        {
                            attributes['fun fact'] && (
                                <Tooltip content="Fun Fact">
                                <div className="flex flex-row gap-2 items-center max-w-[500px]">
                                <div className="flex flex-row gap-1 items-center w-max">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-info w-4 h-4 text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                    </div>
                                <p className="text-sm font-medium truncate">{attributes['fun fact']}</p>
                                </div>
                                </Tooltip>
                            )
                        }
                        {
                            attributes['favorite dartmouth tradition'] && (
                                <Tooltip content="Dartmouth Tradition">
                                    <div className="flex flex-row gap-2 items-center max-w-[500px]">
                                <div className="flex flex-row gap-1 items-center w-max">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-flame-kindling w-4 h-4 text-primary"><path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z"/><path d="m5 22 14-4"/><path d="m5 18 14 4"/></svg>
                                            {/* <p className="text-sm font-medium text-gray-600 dark:text-slate-500 w-max">Dartmouth Tradition</p> */}
                                        </div>
                                <p className="text-sm font-medium truncate">{attributes['favorite dartmouth tradition']}</p>
                                    </div>
                                    </Tooltip>
                            )
                        }
                        {
                            attributes['quote'] && (
                                <Tooltip content="Quote">
                                    <div className="flex flex-row gap-2 items-center max-w-[500px]">
                                <div className="flex flex-row gap-1 items-center w-max">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-quote w-4 h-4 text-primary"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>
                                            {/* <p className="text-sm font-medium text-gray-600 dark:text-slate-500 w-max">Quote</p> */}
                                        </div>
                                <p className="text-sm font-medium truncate">{attributes['quote']}</p>
                                    </div>
                                    </Tooltip>
                            )
                        }
                        
                       
                    </div>
                    <div className="flex flex-row items-center gap-2 mt-0.5">
                        <Tooltip content="Major · Minor">
                        <div key={'studies'} className="px-1.5 py-0.5 text-gray-600 dark:text-slate-500 rounded-full bg-secondary text-xs font-medium flex flex-row gap-1 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-library w-3 h-3"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
                            {member?.major} {member?.minor && " · " + member?.minor}
                        </div>
                        </Tooltip>
                        <Tooltip content="Birthday">
                        <div key={'birthday'} className="px-1.5 py-0.5 text-gray-600 dark:text-slate-500 rounded-full bg-secondary text-xs font-medium flex flex-row gap-1 items-center">
                            <svg fill="none" width="28" viewBox="0 0 24 24" height="28" className="w-3 h-3"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="m12 .757 2.122 2.122A3 3 0 0 1 13 7.829V9h4.5a3 3 0 0 1 3 3v1.646c0 .603-.18 1.177-.5 1.658V19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3.696a3 3 0 0 1-.5-1.658V12a3 3 0 0 1 3-3H11V7.829a3 3 0 0 1-1.121-4.95L12 .757ZM6.5 11a1 1 0 0 0-1 1v1.646a1 1 0 0 0 .629.928l.5.2a1 1 0 0 0 .742 0l1.015-.405a3 3 0 0 1 2.228 0l1.015.405a1 1 0 0 0 .742 0l1.015-.405a3 3 0 0 1 2.228 0l1.015.405a1 1 0 0 0 .742 0l.5-.2a1 1 0 0 0 .629-.928V12a1 1 0 0 0-1-1h-11ZM6 16.674V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2.326a3 3 0 0 1-2.114-.043l-1.015-.405a1 1 0 0 0-.742 0l-1.015.405a3 3 0 0 1-2.228 0l-1.015-.405a1 1 0 0 0-.742 0l-1.015.405A3 3 0 0 1 6 16.674ZM12.002 6a1 1 0 0 0 .706-1.707L12 3.586l-.707.707A1 1 0 0 0 12.002 6Z"></path></svg>
                            {months[parseInt(member?.birthday.split("-")[0] as string)]}, {parseInt(member?.birthday.split("-")[1] as string)}
                        </div>
                        </Tooltip>
                    </div>
            </div>
        </Link>
    )
}
