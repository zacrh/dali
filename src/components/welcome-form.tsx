import { useState, useEffect, FormEvent } from "react";
import { signIn } from "next-auth/react";
// import LoadingDots from "@/components/loading-dots";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { dartmouthEmailPattern } from "@/validations/email";

import { WorkingMember, WorkingAttribute, WorkingMemberRole } from "@/types/members";

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

function capitalizeLastName(lastName: string) {
    return lastName
      .split('-') // Split by hyphen
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each part
      .join('-'); // Join them back with hyphen
  }

export default function WelcomeForm() {
    const { data: session, status } = useSession();
    const [email, setEmail] = useState("");
    const [memberData, setMemberData] = useState<WorkingMember | null>(null);
    const [newAttributes, setNewAttributes] = useState<WorkingAttribute[]>([]);
    const [newRoles, setNewRoles] = useState<WorkingMemberRole[]>([]);

    const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.email) {
            setEmail(session.user.email);

            if (session.user.member) {
                console.log(session.user.member);
                setMemberData(session.user.member);
            } else {
                const match = session.user.email.match(dartmouthEmailPattern);
                console.log(match);
                const firstName = match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : "";
                const lastName = match ? match[3] !== undefined ? capitalizeLastName(match[3]) : capitalizeLastName(match[2]) : "";
                setMemberData({
                    name: firstName + " " + lastName,
                    year: match ? match[4].toLowerCase() !== "gr" ? `20${match[4]}` : match[4] : "",
                    userId: session.user.id,

                    // placeholder — user will enter on page
                    major: "",
                    minor: null,
                    birthday: "",
                    home: "",

                    // always null, not allowing users to upload pfps
                    picture: null,
                    
                    attributes: [],
                    roles: []
                });
            }
        }
    }, [session]);

    const toggleDropdown = (id: string) => {
        console.log('clicking')
        setDropdownOpen((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));
    }

    const onDropdownItemClick = (year: string) => {
        setMemberData((prev) => prev ? ({ ...prev, year }) : null);
        setDropdownOpen({});
        console.log("Clicked on year: ", year, memberData);
    }

    const onBirthdayDropdownItemClick = (type: "month"|"day", value: string) => {
        setMemberData((prev) => prev ? ({ ...prev, birthday: type === "month" ? `${value}-${prev.birthday?.split("-")[1]}` : `${prev.birthday?.split("-")[0]}-${value}` }) : null);
        setDropdownOpen({});
    }

    const onAttributeChange = (name: string, value: string) => {
        const attribute = memberData?.attributes.find(attribute => attribute.name === name);
        if (attribute) {
            setMemberData((prev) => prev ? ({ ...prev, attributes: prev.attributes.map((attribute) => attribute.name === name ? { ...attribute, value } : attribute) }) : null);
        } else {
            const newAttribute =  newAttributes.find(attribute => attribute.name === name);
            if (newAttribute) {
                setNewAttributes((prev) => prev.map((attribute) => attribute.name === name ? { ...attribute, value } : attribute));
            } else {
                newAttributes.push({ name, value }); // we will add all the new attributes to the database once the user submits the form (and their member role is created)
            }
        }
    }

    const onRoleChange = (roleAlias: string, checked: boolean) => {
        // once the user submits the form, we want to delete all the roles that are unchecked (if they exist) and create those that are checked (if they don't exist)
        // we're basically never deleting and always creating — unless the user signing up had data in the dali-provided example data, in which case we're essentially updating their roles
        // we store the new roles in the newRoles array

        // if the role is already in the newRoles array, we want to update it
        if (newRoles.find(role => role.roleAlias === roleAlias)) {
            setNewRoles((prev) => prev.map((role) => role.roleAlias === roleAlias ? { ...role, checked } : role));
        } else {
            setNewRoles((prev) => [...prev, { roleAlias, checked }]);
        }
    }

    const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        const reqBody = {
            ...memberData,
            newAttributes,
            newRoles
        }
        
        fetch("/api/members/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
          }).then(async (res) => {
            setLoading(false);

            if (res.status === 200) {
                console.log("Member Created!")
                setSuccess(true);
                setTimeout(() => {
                    router.push("/")
                });
            } else {
                const { error } = await res.json();
                setError(error);
                console.log("Error: ", error);
            }
          });


    }

  return (
    <form
      onSubmit={(e) => onFormSubmit(e)}
      className="flex flex-col w-full space-y-4 px-4 sm:px-12" // dark:bg-slate-800
    >
        <h3 className="text-xl font-semibold">Basic Stuff</h3>
        <div className="flex flex-row w-full justify-between gap-6">
            <div className="flex flex-col w-1/2 space-y-4">
            <div>
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Full Name <span className="text-error">*</span>
                </label>
                <input
                id="name"
                name="name"
                type="name"
                placeholder="Mark Zuckerberg"
                autoComplete="off"
                defaultValue={memberData?.name || ""}
                onChange={(e) => setMemberData((prev) => prev ? ({ ...prev, name: e.target.value }) : null)}
                required
                className={`mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm`}
                />
            </div>
            <div className="relative">
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Class Year <span className="text-error">*</span>
                </label>

                <button
                    id="dropdownYearButton"
                    data-dropdown-toggle="year-dropdown"
                    className={`mt-1 block w-full appearance-none inline-flex items-center justify-between rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm ${!memberData?.year && "text-gray-400 dark:text-slate-500"}`}
                    type="button"
                    onClick={() => toggleDropdown("year")}
                >
                    {(memberData?.year.toLowerCase() === "gr" ? "Grad Student" : memberData?.year) || "Class year"}
                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                    </svg>
                </button>
                <div id="year-dropdown" className={`z-10 ${dropdownOpen["year"] ? 'absolute' : 'hidden'} p-1 mt-1 w-full rounded-md border border-gray-300 dark:border-border dark:bg-secondary  shadow`} onBlur={() => setDropdownOpen({})}>
                    <ul aria-labelledby="dropdownYearButton" className="divide-y divide-border text-sm text-gray-700 dark:text-gray-200 overflow-scroll max-h-60">
                        <li key={"GR"} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={() => onDropdownItemClick("GR")}>
                            <p className="cursor-pointer flex items-center rounded justify-between w-full px-3 py-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">Grad Student</p>
                        </li>
                        {
                            Array.from({ length: 15 }, (_, i) => 2015 + i).reverse().map((year) => (
                                <li key={year} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={() => onDropdownItemClick(year.toString())}>
                                    <p className="cursor-pointer flex items-center rounded justify-between w-full px-3 py-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">{year}</p>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
            {error !== "" && (
                <div className="flex flex-row px-3 py-2.5 rounded-md gap-2 bg-error text-white items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-triangle-alert w-5 h-5 min-h-5 min-w-5 mr-px"
                >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                </svg>
                <p className="text-left text-sm font-medium text-white">
                    {error}
                </p>
                </div>
            )}
            </div>
            <div className="flex flex-col w-1/2 space-y-4">
            <div className="relative">
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Birthday <span className="text-error">*</span>
                </label>
                <div className="flex flex-row gap-2">
                    <div className="relative w-1/2">
                        <button
                            id="dropdownMonthButton"
                            data-dropdown-toggle="month-dropdown"
                            className={`mt-1 block w-full appearance-none inline-flex items-center justify-between rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm ${!memberData?.birthday && "text-gray-400 dark:text-slate-500"}`}
                            type="button"
                            onClick={() => toggleDropdown("month")}
                        >
                            {memberData?.birthday ? (months[parseInt(memberData?.birthday.split("-")[0]) - 1]) : "Month"}
                            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                            </svg>
                        </button>
                        <div id="month-dropdown" className={`z-10 ${dropdownOpen["month"] ? 'absolute' : 'hidden'} p-1 mt-1 w-full rounded-md border border-gray-300 dark:border-border dark:bg-secondary  shadow`} onBlur={() => setDropdownOpen({})}>
                            <ul aria-labelledby="dropdownMonthButton" className="divide-y divide-border text-sm text-gray-700 dark:text-gray-200 overflow-scroll max-h-60">
                                {
                                    months.map((month) => (
                                        <li key={month} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={() => onBirthdayDropdownItemClick("month", (months.indexOf(month) + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}))}>
                                            <p className="cursor-pointer flex items-center rounded justify-between w-full px-3 py-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">{month}</p>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="relative w-1/2">
                        <button
                            id="dropdownDayButton"
                            data-dropdown-toggle="day-dropdown"
                            className={`mt-1 block w-full appearance-none inline-flex items-center justify-between rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm ${!memberData?.birthday && "text-gray-400 dark:text-slate-500"}`}
                            type="button"
                            onClick={() => toggleDropdown("day")}
                        >
                            {memberData?.birthday ? (parseInt(memberData?.birthday.split("-")[1])) : "Day"}
                            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                            </svg>
                        </button>
                        <div id="day-dropdown" className={`z-10 ${dropdownOpen["day"] ? 'absolute' : 'hidden'} p-1 mt-1 w-full rounded-md border border-gray-300 dark:border-border dark:bg-secondary  shadow`} onBlur={() => setDropdownOpen({})}>
                            <ul aria-labelledby="dropdownDayButton" className="divide-y divide-border text-sm text-gray-700 dark:text-gray-200 overflow-scroll max-h-60">
                                {
                                    Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                                        <li key={day} className="cursor-pointer flex items-center py-1 first:pt-0 last:pb-0" onClick={() => onBirthdayDropdownItemClick("day", day.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}))}>
                                            <p className="cursor-pointer flex items-center rounded justify-between w-full px-3 py-2 text-sm font-medium text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-tertiary">{day}</p>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Home <span className="text-error">*</span>
                </label>
                <input
                id="home"
                name="home"
                type="home" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Houston, TX"
                autoComplete="off"
                defaultValue={memberData?.home || ""}
                onChange={(e) => setMemberData((prev) => prev ? ({ ...prev, home: e.target.value }) : null)}
                required
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            </div>
        </div>
        
        <h3 className="text-xl font-semibold pt-4">Academics</h3>
        <div className="flex flex-row w-full justify-between gap-6">
            <div className="flex flex-col w-1/2 space-y-4">
            <div>
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Major <span className="text-error">*</span>
                </label>
                <input
                id="major"
                name="major"
                type="major" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Computer Science"
                autoComplete="off"
                defaultValue={memberData?.major || ""}
                onChange={(e) => setMemberData((prev) => prev ? ({ ...prev, major: e.target.value }) : null)}
                required
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 dark:placeholder-slate-500 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            
            </div>
            <div className="flex flex-col w-1/2 space-y-4">
            <div>
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Minor
                </label>
                <input
                id="minor"
                name="minor"
                type="minor" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Economics"
                autoComplete="off"
                onChange={(e) => setMemberData((prev) => prev ? ({ ...prev, minor: e.target.value }) : null)}
                defaultValue={memberData?.minor || ""}
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            </div>
        </div>
        <h3 className="text-xl font-semibold pt-4">DALI Roles</h3>
        <div className="flex flex-row w-full justify-between gap-6">
            <div className="flex flex-col w-1/2 space-y-4">
            <div className="flex flex-row w-full justify-between gap-6 items-center">
                <label
                className="text-md font-medium text-gray-600 dark:text-slate-400"
                >
                Developer
                </label>
                <input id="dev-checkbox" type="checkbox" value="" checked={newRoles.find(role => role.roleAlias === "dev") ? newRoles.find(role => role.roleAlias === "dev")?.checked : memberData?.roles?.find(role => role.roleAlias === "dev") ? true : false} onChange={(e) => onRoleChange("dev", e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 dark:bg-secondary border-gray-300 dark:border-border rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-primary focus:ring-2" />
            </div>
            <div className="flex flex-row w-full justify-between gap-6 items-center">
                <label
                className="text-md font-medium text-gray-600 dark:text-slate-400"
                >
                Designer
                </label>
                <input id="des-checkbox" type="checkbox" value="" checked={newRoles.find(role => role.roleAlias === "des") ? newRoles.find(role => role.roleAlias === "des")?.checked : memberData?.roles?.find(role => role.roleAlias === "des") ? true : false} onChange={(e) => onRoleChange("des", e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 dark:bg-secondary border-gray-300 dark:border-border rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-primary focus:ring-2" />
            </div>
            <div className="flex flex-row w-full justify-between gap-6 items-center">
                <label
                className="text-md font-medium text-gray-600 dark:text-slate-400"
                >
                Product Manager
                </label>
                <input id="pm-checkbox" type="checkbox" value="" checked={newRoles.find(role => role.roleAlias === "pm") ? newRoles.find(role => role.roleAlias === "pm")?.checked : memberData?.roles?.find(role => role.roleAlias === "pm") ? true : false} onChange={(e) => onRoleChange("pm", e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 dark:bg-secondary border-gray-300 dark:border-border rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-primary focus:ring-2" />
            </div>
            
            
            </div>
            <div className="flex flex-col w-1/2 space-y-4">
            <div className="flex flex-row w-full justify-between gap-6 items-center">
                <label
                className="text-md font-medium text-gray-600 dark:text-slate-400"
                >
                Core
                </label>
                <input id="core-checkbox" type="checkbox" value="" checked={newRoles.find(role => role.roleAlias === "core") ? newRoles.find(role => role.roleAlias === "core")?.checked : memberData?.roles?.find(role => role.roleAlias === "core") ? true : false} onChange={(e) => onRoleChange("core", e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 dark:bg-secondary border-gray-300 dark:border-border rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-primary focus:ring-2" />
            </div>
            <div className="flex flex-row w-full justify-between gap-6 items-center">
                <label
                className="text-md font-medium text-gray-600 dark:text-slate-400"
                >
                Mentor
                </label>
                <input id="mentor-checkbox" type="checkbox" value="" checked={newRoles.find(role => role.roleAlias === "mentor") ? newRoles.find(role => role.roleAlias === "mentor")?.checked : memberData?.roles?.find(role => role.roleAlias === "mentor") ? true : false} onChange={(e) => onRoleChange("mentor", e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 dark:bg-secondary border-gray-300 dark:border-border rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-primary focus:ring-2" />
            </div>
            </div>
        </div>
        <h3 className="text-xl font-semibold pt-4">More About You</h3>
        <div className="flex flex-row w-full justify-between gap-6">
            <div className="flex flex-col w-1/2 space-y-4">
            <div>
                <label
                htmlFor="favoriteThing1"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Favorite Thing #1
                </label>
                <input
                id="favoriteThing1"
                name="favoriteThing1"
                type="favoriteThing" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Programming"
                autoComplete="off"
                defaultValue={memberData?.attributes?.find(attribute => attribute.name === "favorite thing 1")?.value || ""}
                onChange={(e) => onAttributeChange("favorite thing 1", e.target.value)}
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            <div>
                <label
                htmlFor="favoriteThing2"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Favorite Thing #2
                </label>
                <input
                id="favoriteThing2"
                name="favoriteThing2"
                type="favoriteThing" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Long walks on the beach"
                autoComplete="off"
                defaultValue={memberData?.attributes?.find(attribute => attribute.name === "favorite thing 2")?.value || ""}
                onChange={(e) => onAttributeChange("favorite thing 2", e.target.value)}
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            <div>
                <label
                htmlFor="favoriteThing3"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Favorite Thing #3
                </label>
                <input
                id="favoriteThing3"
                name="favoriteThing3"
                type="favoriteThing" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Formula 1"
                autoComplete="off"
                defaultValue={memberData?.attributes?.find(attribute => attribute.name === "favorite thing 3")?.value || ""}
                onChange={(e) => onAttributeChange("favorite thing 3", e.target.value)}
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            
            </div>
            <div className="flex flex-col w-1/2 space-y-4">
            <div>
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Favorite Quote
                </label>
                <input
                id="quote"
                name="quote"
                type="quote" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder={`"Drop the 'the' — it's cleaner" - Sean Parker`}
                autoComplete="off"
                defaultValue={memberData?.attributes?.find(attribute => attribute.name === "quote")?.value || ""}
                onChange={(e) => onAttributeChange("quote", e.target.value)}
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            <div>
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Favorite Dartmouth Tradition
                </label>
                <input
                id="favoriteDartmouthTradition"
                name="favoriteDartmouthTradition"
                type="favoriteDartmouthTradition" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Screaming at freshmen as they run around the bonfire"
                autoComplete="off"
                defaultValue={memberData?.attributes?.find(attribute => attribute.name === "favorite dartmouth tradition")?.value || ""}
                onChange={(e) => onAttributeChange("favorite dartmouth tradition", e.target.value)}
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            <div>
                <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-slate-400"
                >
                Fun Fact
                </label>
                <input
                id="fact"
                name="fact"
                type="fact" // invalid, but putting "text" adds a black focus ring regardless of color scheme (light or dark)
                placeholder="Economics"
                autoComplete="off"
                defaultValue={memberData?.attributes?.find(attribute => attribute.name === "fun fact")?.value || ""}
                onChange={(e) => onAttributeChange("fun fact", e.target.value)}
                className="mt-1 block w-full appearance-none rounded-md border-2 border-gray-300 dark:bg-secondary dark:border-secondary dark:hover:border-border px-3.5 py-2 placeholder-gray-400 focus:border-black dark:focus:border-primary dark:focus:bg-tertiary dark:focus:border-md focus:outline-none focus:ring-black sm:text-sm"
                />
            </div>
            </div>
        </div>

      <div className="flex flex-row w-full items-end justify-end pb-16">
        <button
          disabled={loading}
          className={`${
            loading
              ? "cursor-not-allowed bg-primary border-primary brightness-90"
              : "border-primary bg-primary text-white font-medium hover:brightness-110"
          } flex mt-4 h-10 w-full max-w-40 items-center justify-center rounded-md border text-sm transition-all focus:outline-none`}
        >
          {loading ? (
            //   <LoadingDots color="#808080" />
            <p>Loading...</p>
          ) : (
            <p>Finish</p> // Continue
          )}
        </button>
      </div>
    </form>
  );
}
