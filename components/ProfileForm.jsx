import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function ProfileForm(props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [gfg, setGfg] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.post(`http://localhost:3000/api/user/`, {
      name: username,
      email,
      leetcode,
      gfg,
    });

    const data = response.data;
    console.log(data);

    if (!data.error) {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (!username) {
      setUsername(props.username);
    }
    if (!email) {
      setEmail(props.email);
    }
    if (!leetcode) {
      setLeetcode(props.leetcode);
    }
    if (!gfg) {
      setGfg(props.gfg);
    }
  });

  return (
    <div className="">
      <div className="px-16 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-bold mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-blue-500"
              required
              disabled
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="leetcode"
              className="block text-gray-700 font-bold mb-2"
            >
              LeetCode Username (optional)
            </label>
            <input
              id="leetcode"
              type="text"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="border-2 border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="gfg" className="block text-gray-700 font-bold mb-2">
              GFG Username (optional)
            </label>
            <input
              id="gfg"
              type="text"
              value={gfg}
              onChange={(e) => setGfg(e.target.value)}
              className="border-2 border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 items-center rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
