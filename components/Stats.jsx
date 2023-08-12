import React, { useEffect, useState } from "react";
import StatRow from "./StatRow";
import AddFriendPopup from "./AddFriendPopup";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Stats() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFriendPopup, setShowFriendPopup] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("");
  const tableHeadings = ["today", "last 7 days", "last 30 days", "total"];
  const { data: session } = useSession();

  const handlePopup = (val) => {
    setShowFriendPopup(val);
  };

  const handleSort = (sortCol) => {
    setSortBy(sortCol);
  };

  useEffect(() => {
    async function updateFriends(updatedFriends) {
      const { email } = session.user;
      const { data } = await axios.put(`/api/user/${email}`, {
        friends: updatedFriends,
      });
    }

    async function fetchData() {
      const { email } = session.user;
      setLoading(false);

      try {
        const { data } = await axios.get(`/api/user/${email}`);

        if (data.user.friends?.length) {
          setFriends(data.user.friends);

          const frnds = data.user.friends;
          const frndSize = frnds.length;

          if (friends.length === frndSize) return;

          try {
            const friendData = [];

            toast.info(`Updating stats (0/${frndSize})`, {
              autoClose: false,
            });

            let i = 1;
            for (const frnd of frnds) {
              const username = frnd.leetcode.split("/")[3];
              const { data } = await axios.get(
                `/api/stats/leetcode/${username}`
              );

              data.name = frnd.name;
              data.leetcode = frnd.leetcode;

              friendData.push(data);

              toast.dismiss();
              toast.info(`Updating stats (${i++}/${frndSize})`, {
                autoClose: false,
              });
            }

            updateFriends(friendData);
            setFriends(friendData);
            sessionStorage.setItem("friends", JSON.stringify(friendData));

            toast.dismiss();
            toast.info("Data fetched succesfully.");

            setLoading(false);
          } catch (err) {
            toast.dismiss();
            toast.error("Error fetching data");
            setLoading(false);
          }
        }
      } catch (err) {}
    }

    async function initialLoad() {
      if (loading) {
        const frnds = sessionStorage.getItem("friends");

        if (frnds) setFriends(JSON.parse(sessionStorage.getItem("friends")));
        else await fetchData();

        setLoading(false);
      }
    }

    initialLoad();
  }, [loading, showFriendPopup]);

  const handleClickRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleLoading = (val) => {
    setLoading(val);
  };

  return (
    <div className="p-4 bg-gray-50 w-full">
      <div className="flex justify-between items-center mb-4 mx-24 mt-3">
        <h2 className="text-lg font-medium text-gray-800">Dashboard</h2>
        {showFriendPopup && (
          <div>
            <AddFriendPopup
              showFriendPopup={showFriendPopup}
              setShowFriendPopup={handlePopup}
              handleLoading={handleLoading}
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
              <th
                scope="col"
                className="px-6 py-3 text-center"
                onClick={() => handleSort("today")}
              >
                Today
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center"
                onClick={() => handleSort("last 7 days")}
              >
                Last 7 days
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center"
                onClick={() => handleSort("total")}
              >
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
                handleClickRow={handleClickRow}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer position="bottom-left" />
    </div>
  );
}
