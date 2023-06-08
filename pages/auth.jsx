import Layout from "@/components/Layout";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Auth() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col flex-1 justify-center items-center">
        <p>Not signed in</p>
        <button className="border-2 border-red-400" onClick={() => signIn()}>
          Sign in
        </button>
      </div>
    </Layout>
  );
}
