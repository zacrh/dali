import Image from "next/image";
import Form from "@/components/form";
import Link from "next/link";
import LeftNav from "@/components/left-nav";
import Feed from "@/components/feed";
import RightBar from "@/components/right-bar";
import Layout from "./layout";

export default function Home() {

    return(
        <Layout>
            <Feed />
        </Layout>
    )

}