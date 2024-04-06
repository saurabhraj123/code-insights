import React, { useEffect, useState } from "react";
import StatRow from "./StatRow";
import AddFriendPopup from "./AddFriendPopup";
import axios from "axios";
import { useSession } from "next-auth/react";
import FullScreenLoader from "./FullScreenLoader";

export default function Stats() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFriendPopup, setShowFriendPopup] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();

  const getStatsFromSessionStorage = () => {
    return JSON.parse(sessionStorage.getItem("friends"));
  };

  const getStats = async () => {
    setLoading(true);
    try {
      const localFriends = getStatsFromSessionStorage();
      if (localFriends) {
        setFriends(localFriends);
        setLoading(false);
        return;
      }

      const { email } = session.user;
      const { data } = await axios.get(`/api/user/${email}`);
      const friends = data.user.friends;
      if (friends.length) setFriends(friends);
      updateStats(friends);
    } catch (err) {
      setLoading(false);
    }
  };

  async function updateStats(fetchedFriends) {
    try {
      const statPromises = fetchedFriends.map((friend) => {
        const username = friend.leetcode.split("/")[3];
        return axios.get(`/api/stats/leetcode/${username}`);
      });

      const updatedFriendsResponse = await Promise.all(statPromises);
      const updatedFriends = updatedFriendsResponse.map((response, index) => {
        return { ...fetchedFriends[index], ...response.data };
      });

      updateFriends(updatedFriends);
      setFriends(updatedFriends);
      sessionStorage.setItem("friends", JSON.stringify(updatedFriends));
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  async function updateFriends(updatedFriends) {
    const { email } = session.user;
    const { data } = await axios.put(`/api/user/${email}`, {
      friends: updatedFriends,
    });
  }

  useEffect(() => {
    getStats();
  }, [showFriendPopup]);

  return (
    <div className="p-4 bg-gray-50 w-full">
      <div className="flex justify-between items-center mb-4 mx-24 mt-3">
        <h2 className="text-lg font-medium text-gray-800">Dashboard</h2>
        {showFriendPopup && (
          <div>
            <AddFriendPopup
              showFriendPopup={showFriendPopup}
              setShowFriendPopup={setShowFriendPopup}
            />
          </div>
        )}
        <div className="space-x-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            onClick={() => setShowFriendPopup(true)}
          >
            Add friend
          </button>
        </div>
      </div>

      {loading && (
        <div className="h-[50px]">
          <FullScreenLoader />
        </div>
      )}

      {friends.length === 0 && !loading && (
        <p className="mx-24 text-teal-700">
          No friends found. Click on the Add Friend button to add a friend.
        </p>
      )}

      {friends.length !== 0 && !loading && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg mx-24">
          <table className="w-full bg-white border border-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Today
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Last 7 days
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {friends.map((friend, index) => (
                <StatRow
                  key={index}
                  user={friend}
                  index={index}
                  expandedRow={expandedRow}
                  handleClickRow={() =>
                    setExpandedRow(expandedRow === index ? null : index)
                  }
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
