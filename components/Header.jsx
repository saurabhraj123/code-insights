import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col text-gray-200 bg-purple-500 shadow-xl justify-between items-center px-10 py-3 sm:flex-row">
      <Link href="/">
        <h1 className="text-2xl">Code Insights</h1>
      </Link>
      <div className="flex gap-4 items-center">
        {session && (
          <span
            className="hover:cursor-pointer"
            onClick={() => router.push("/user/edit")}
          >
            Edit Profile
          </span>
        )}
        <Link href="/dashboard" className="">
          {!session && <span onClick={() => signIn()}>Log In</span>}
          {session && <span onClick={() => signOut()}>Log out</span>}
        </Link>
      </div>
    </div>
  );
}
