import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import addFriendSchema from "@/utils/addFriendValidator";
import Spinner from "./Spinner";

export default function AddFriendPopup({
  showFriendPopup,
  setShowFriendPopup,
}) {
  const [name, setName] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [addInProgress, setAddInProgress] = useState(false);
  const [error, setError] = useState("");

  const boxRef = useRef(null);
  const { data: session } = useSession();

  const extractUsername = (url) => {
    const pattern = /https:\/\/leetcode\.com\/([^/]+)/;
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  const handlePopup = (e) => {
    if (boxRef.current && !boxRef.current.contains(e.target))
      setShowFriendPopup(false);
  };

  const handleSubmit = async () => {
    setAddInProgress(true);

    try {
      const value = await addFriendSchema.validateAsync({
        name,
        leetcode,
      });

      const friend = { name, leetcode };

      const { email } = session.user;
      console.log({ email, friend, value });

      const res = await axios.put(`/api/user/${email}`, {
        friend: friend,
      });

      if (res.status == 404) {
        console.log("did I come here");
        setError({ message: res.data });
        setAddInProgress(false);
        return;
      }

      console.log("data", res.data);

      const { data: stats } = await axios.get(
        `/api/stats/leetcode/${extractUsername(leetcode)}`
      );

      setShowFriendPopup(false);
      const newFriendsList = JSON.parse(sessionStorage.getItem("friends"));
      newFriendsList.push({ ...friend, ...stats });
      sessionStorage.setItem("friends", JSON.stringify(newFriendsList));
    } catch (err) {
      const msg = err.response?.data ? err.response.data : err.message;
      console.log({ err });
      if (typeof msg === "string") setError({ message: msg });
      else setError({ message: "Somethign went wrong" });
      console.log("error", err);
      setAddInProgress(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError(null);
  };

  const handleLeetcodeChange = (e) => {
    setLeetcode(e.target.value);
    setError(null);
  };

  return (
    <div
      className={`fixed inset-0 z-10 bg-gray-900 bg-opacity-50 flex justify-center items-center z-[999999]${
        showFriendPopup ? "" : "hidden"
      }`}
      onClick={handlePopup}
    >
      <div className="bg-white w-96 rounded-lg p-4" ref={boxRef}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Add Friend</h2>
          <button
            className="text-gray-500 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowFriendPopup(true)}
          ></button>
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            className="bg-gray-100 rounded-md py-1 px-2 text-gray-700 w-full"
            value={name}
            onChange={handleNameChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="leetcode" className="block text-gray-700">
            Leetcode *
          </label>
          <input
            type="text"
            id="leetcode"
            className="bg-gray-100 rounded-md py-1 px-2 text-gray-700 w-full"
            value={leetcode}
            placeholder="https://leetcode.com/username"
            onChange={handleLeetcodeChange}
          />
        </div>

        {error && <p className="text-red-600">{error.message}</p>}

        <div className="flex justify-center mt-4">
          <button
            className={`flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md ${
              addInProgress
                ? "cursor-not-allowed bg-gray-300 hover:bg-gray-300 "
                : ""
            }`}
            onClick={handleSubmit}
            disabled={addInProgress}
          >
            <div>Submit</div>
            {addInProgress ? <Spinner /> : null}
          </button>
        </div>
      </div>
    </div>
  );
}
