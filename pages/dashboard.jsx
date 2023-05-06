import Layout from "@/components/Layout";
import { useSession, signIn, signOut } from "next-auth/react"

export default function Dashboard() {
    const { data: session, status } = useSession()

    if (status == 'loading') {
        return <p>Loading...</p>
    }

    return (
        <Layout>
            {!session &&
                <p>You must login first.
                    <span
                        className="text-blue-600 hover:cursor-pointer"
                        onClick={() => signIn()
                        }>
                        Log in
                    </span>
                </p>
            }

            {session && <h1>Dashboard</h1>}
        </Layout>
    );
}