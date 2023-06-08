// import axios from "axios";
// import { useSession, signIn, signOut } from "next-auth/react";
// import { useEffect, useState } from "react";
// import Layout from "@/components/Layout";
// import ProfileForm from "@/components/ProfileForm";
// import Stats from "@/components/Stats";

// export default function Dashboard() {
//   const { data: session, status } = useSession();
//   const [isNewUser, setNewUser] = useState(true);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (session) {
//       async function getUser() {
//         const email = session.user.email;

//         const response = await axios.get(
//           `http://localhost:3000/api/user/${email}`
//         );
//         const data = response.data;

//         if (data.error) {
//           setNewUser(true);
//         } else {
//           setNewUser(false);
//         }

//         setLoading(false);
//       }

//       getUser();
//     }
//   });

//   if (status == "loading") {
//     return <p>Loading...</p>;
//   }

//   return (
//     <Layout>
//       {loading && <p>Loading...</p>}
//       {!session && (
//         <p>
//           You must login first.
//           <span
//             className="text-blue-600 hover:cursor-pointer"
//             onClick={() => signIn()}
//           >
//             Log in
//           </span>
//         </p>
//       )}

//       {session &&
//         !loading &&
//         (isNewUser ? (
//           <div className="flex flex-1 mt-8 justify-center">
//             <ProfileForm
//               email={session.user.email}
//               username={session.user.name}
//             />
//           </div>
//         ) : (
//           // <div>Dashboard</div>

//           <Stats />
//         ))}
//     </Layout>
//   );
// }
