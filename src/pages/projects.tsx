import { useRouter } from 'next/router'
import Layout from './layout';
import ProjectsPage from '@/components/projectsPage';
import { useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function Projects() {
    const { data: session, status } = useSession();
    const router = useRouter();

    return (
        <Layout>
            <ProjectsPage session={session} />
        </Layout>
    )
}