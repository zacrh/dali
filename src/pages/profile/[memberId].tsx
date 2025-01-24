import { useRouter } from 'next/router'
import Layout from '../layout';
import ProfileFeed from '@/components/profileFeed';
import { useEffect } from 'react';


export default function Profile() {
  const router = useRouter()
  const { memberId } = router.query;

  useEffect(() => {
    console.log("memberId ", memberId)
  }, [memberId])

  return (
    <Layout>
        <ProfileFeed memberId={parseInt(memberId as string)} />
    </Layout>
  )
}