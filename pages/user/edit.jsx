import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import axios from "axios";
import EditFriendPopup from "@/components/EditFriendPopup";

export default function EditProfile() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [friends, setFriends] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [activeFriendName, setActiveFriendName] = useState("");
  const [activeFriendLeetcode, setActiveLeetcode] = useState("");

  const tabs = ["Personal", "Friends"];
  const { data: session, status } = useSession();

  const handleEditFriend = (name, leetcode) => {
    setShowPopup(true);
    console.log("name is", name);
    setActiveFriendName(name);
    setActiveLeetcode(leetcode);
  };

  useEffect(() => {
    async function getData() {
      const { email } = session?.user;
      if (email) {
        setLoading(true);
        console.log("loading..");
        const { data } = await axios.get(
          `http://localhost:3000/api/user/${email}`
        );
        console.log("data in edit is", data.user.friends);
        setUser(data.user);
        setFriends(data.user.friends);
        setLoading(false);
      }
    }

    if (session) getData();
  }, [session]);

  const handleNameChange = (e) => {
    e.preventDefault();

    const userCopy = { ...user };
    userCopy.name = e.target.value;
    setUser(userCopy);
  };

  const handleLeetcodeChange = (e) => {
    e.preventDefault();

    const userCopy = { ...user };
    userCopy.leetcode = e.target.value;
    setUser(userCopy);
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    const { data } = await axios.put(
      `http://localhost:3000/api/user/${session?.user?.email}`,
      {
        name: user.name,
        leetcode: user.leetcode,
      }
    );

    console.log("user updated", data);
  };

  const handleFriendUpdate = async (oldLeetcode, newName, newLeetcode) => {
    const updatedFriend = friends.find(
      (friend) => friend.leetcode === oldLeetcode
    );
    updatedFriend.name = newName;
    updatedFriend.leetcode = newLeetcode;

    const fileteredFriends = friends.filter(
      (friend) => friend.leetcode != oldLeetcode
    );
    fileteredFriends.push(updatedFriend);

    const { data } = await axios.put(
      `http://localhost:3000/api/user/${session?.user?.email}`,
      { friends: fileteredFriends }
    );
  };

  return (
    <Layout>
      {!session && <p>Please login first...</p>}
      {session && (
        <div className="flex flex-col w-full items-center">
          <h1 className="mt-3 text-lg">Edit Profile</h1>
          <div className="flex flex-col rounded-lg shadow-lg w-full border b-1 max-w-[800px]">
            <div className="flex">
              <div className="w-[20%] border-r-2">
                {tabs.map((tabString, index) => (
                  <div
                    key={index}
                    className={`${
                      index === selectedTab ? "bg-blue-500 text-white" : ""
                    } ${
                      index === tabs.length - 1 ? "" : "border-b-2"
                    } pl-3 p-2 cursor-pointer`}
                    onClick={() => setSelectedTab(index)}
                  >
                    {tabString}
                  </div>
                ))}
              </div>
              <div className="flex-grow p-4">
                {selectedTab === 0 && (
                  <div>
                    <h2 className="text-lg font-semibold">
                      Personal Information
                    </h2>
                    <form className="mt-4">
                      <div className="mb-4">
                        <label className="block font-semibold mb-1">
                          Name:
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          value={user.name}
                          onChange={handleNameChange}
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">
                          LeetCode Username:
                        </label>
                        <input
                          type="text"
                          name="leetcode"
                          className="border border-gray-300 rounded-md px-2 py-1 w-full"
                          value={user.leetcode}
                          onChange={handleLeetcodeChange}
                        />
                      </div>
                      <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleUserUpdate}
                      >
                        Save
                      </button>
                    </form>
                  </div>
                )}
                {selectedTab === 1 && (
                  <div>
                    <h2 className="text-lg font-semibold">Friends List</h2>
                    {/* {loading && <p>Loading...</p>} */}
                    {
                      <ul className="mt-4">
                        {friends.map((friend, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between mt-2"
                          >
                            <span>{friend.name}</span>
                            <button
                              className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                              onClick={() =>
                                handleEditFriend(friend.name, friend.leetcode)
                              }
                            >
                              Edit
                            </button>
                          </li>
                        ))}
                      </ul>
                    }

                    {showPopup && (
                      <EditFriendPopup
                        showFriendPopup={showPopup}
                        setShowFriendPopup={setShowPopup}
                        nameProp={activeFriendName}
                        leetcodeProp={activeFriendLeetcode}
                        handleSubmit={handleFriendUpdate}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
