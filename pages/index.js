import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Layout from '@/components/Layout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession()
  const { push } = useRouter();

  if (session) {
    push('/dashboard');
  }

  return (
    <Layout>
      <Hero />
    </Layout>
  )
}
