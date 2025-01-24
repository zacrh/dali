import { useRouter } from 'next/router'
import Layout from '../layout';
import ProjectFeed from '@/components/projectFeed';
import { useEffect } from 'react';

export default function Project() {
    const router = useRouter();
    const { projectAlias } = router.query;

    useEffect(() => {
        console.log("projectAlias ", projectAlias)
    }, [projectAlias])

    return (
        <Layout>
            <ProjectFeed projectAlias={projectAlias as string} />
        </Layout>
    )
}