import axios from "axios";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProfileForm from "@/components/ProfileForm";
import Stats from "@/components/Stats";
import { ThreeDots } from "react-loader-spinner";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isNewUser, setNewUser] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      async function getUser() {
        const email = session.user.email;

        const response = await axios.get(`/api/user/${email}`);
        const data = response.data;

        if (data.error) {
          setNewUser(true);
        } else {
          setNewUser(false);
        }

        setLoading(false);
      }

      getUser();
    }
  });

  if (status == "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <ThreeDots
          height="80"
          width="80"
          radius="9"
          color="#3b82f6"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClassName=""
          visible={true}
        />
      </div>
    );
  }

  return (
    <Layout>
      {loading && session && (
        <div className="flex items-center justify-center h-screen w-full">
          <ThreeDots
            height="80"
            width="80"
            radius="9"
            color="#3b82f6"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClassName=""
            visible={true}
          />
        </div>
      )}
      {!session && (
        <div className="flex flex-col justify-center items-center w-full bg-gray-100">
          <div className="flex flex-col items-center justify-center">
            <h3 className="mb-3">Sign in with google to continue</h3>
            <div>
              <button
                className="flex justify-center items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-100"
                onClick={() => signIn("google")}
              >
                <img src="/google.png" className="w-4 h-4 mr-2" />
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
        // <p>
        //   You must login first.
        //   <span
        //     className="text-blue-600 hover:cursor-pointer"
        //     onClick={() => signIn()}
        //   >
        //     Log in
        //   </span>
        // </p>
      )}

      {session &&
        !loading &&
        (isNewUser ? (
          <div className="flex flex-1 pt-4 justify-center bg-gray-100">
            <ProfileForm
              email={session.user.email}
              username={session.user.name}
            />
          </div>
        ) : (
          // <div>Dashboard</div>

          <Stats />
        ))}
    </Layout>
  );
}
