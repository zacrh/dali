import Image from "next/image";
import Form from "@/components/form";
import Link from "next/link";
import LeftNav from "@/components/left-nav";
import Feed from "@/components/feed";

export default function Home() {

    return(

    <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-row w-full h-full max-w-5xl">
            <LeftNav />
            <Feed />
            {/* <div className="flex flex-col w-full h-full p-4">Hellooo</div> */}
        </div>
    </div>
    )

}