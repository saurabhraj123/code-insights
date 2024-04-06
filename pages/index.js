import axios from "axios";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProfileForm from "@/components/ProfileForm";
import Stats from "@/components/Stats";
import FullScreenLoader from "@/components/FullScreenLoader";
import SignInPage from "@/components/SignInPage";

export default function Dashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    window.onbeforeunload = () => sessionStorage.clear();
  }, []);

  const isLoading = status === "loading";

  return (
    <Layout>
      {session === null && <SignInPage />}
      {status === "authenticated" && <Stats />}
    </Layout>
  );
}
