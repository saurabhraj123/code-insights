import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="flex flex-col text-gray-200 bg-white shadow-gray-300 z-[999] drop-shadow justify-between items-center px-32 py-3 sm:flex-row">
      <Link href="/">
        <h1 className="flex items-center justify-center text-2xl">
          {" "}
          <img src="/logo.png" className="w-5 h-5 mr-2" />{" "}
          <span className="text-lg text-gray-500">Leetcode Insights </span>
        </h1>
      </Link>
      <div className="flex gap-4 items-center text-gray-500">
        {session && (
          <span
            className="hover:cursor-pointer"
            onClick={() => router.push("/user/edit")}
          >
            Edit Profile
          </span>
        )}
        <Link href="/" className="text-gray-500">
          {!session && <span onClick={() => signIn("google")}>Log In</span>}
          {session && <span onClick={() => signOut()}>Log out</span>}
        </Link>
      </div>
    </div>
  );
}
