import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import addFriendSchema from "@/utils/addFriendValidator";

export default function ProfileForm(props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [error, setError] = useState("");
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitInProgress(true);

    try {
      const value = await addFriendSchema.validateAsync({
        name: username,
        leetcode,
      });

      console.log("value of validation is:", value);

      const response = await axios.post(`/api/user/`, {
        name: username,
        email,
        leetcode,
      });

      const data = response.data;
      console.log(data);

      if (!data.error) {
        router.push("/");
      }
    } catch (err) {
      // if (response.status == "404") {
      // setError({ leetcode: "leetcode profile is not valid" });

      let msg = err.response?.data ? err.response.data : err.message;
      console.log("message is:", msg);

      msg = msg || "leetcode profile is not valid";
      setError(msg);

      setSubmitInProgress(false);
      // return;
      // }
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
  }, [props]);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl text-gray-600 mb-6">Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-black mb-2">
              Name *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-black mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-blue-500"
              required
              disabled
            />
          </div>
          <div className="mb-4">
            <label htmlFor="leetcode" className="block text-black mb-2">
              LeetCode Profile *
            </label>
            <input
              id="leetcode"
              type="text"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              placeholder="https://leetcode.com/username/"
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 mb-2">{error.message || error}</p>
          )}

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {submitInProgress ? "Submitting.." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
