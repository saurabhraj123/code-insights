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
  // const [friendUpdate]

  const tableHeadings = ["today", "last 7 days", "last 30 days", "total"];
  const { data: session } = useSession();

  const handlePopup = (val) => {
    setShowFriendPopup(val);
  };

  const handleSort = (sortCol) => {
    setSortBy(sortCol);
  };

  useEffect(() => {
    console.log("ka ho");
    async function updateFriends(updatedFriends) {
      const { email } = session.user;
      const { data } = await axios.put(
        `http://localhost:3000/api/user/${email}`,
        { friends: updatedFriends }
      );

      console.log("friends updated");
    }

    async function fetchData() {
      const { email } = session.user;
      setLoading(false);

      try {
        console.log(
          "1111111111111111111111111111 Yaha hu main 111111111111111111111111111"
        );
        const { data } = await axios.get(
          `http://localhost:3000/api/user/${email}`
        );

        console.log("data is", data.user.friends);

        if (data.user.friends?.length) {
          setFriends(data.user.friends);

          const frnds = data.user.friends;
          console.log("friends is", frnds);

          const frndSize = frnds.length;

          if (friends.length === frndSize) return;

          try {
            const friendData = [];

            toast.info(`Fetching latest data (0/${frndSize})`, {
              autoClose: false,
            });

            let i = 1;
            for (const frnd of frnds) {
              const username = frnd.leetcode.split("/")[3];
              const { data } = await axios.get(
                `http://localhost:3000/api/stats/leetcode/${username}`
              );

              console.log("friend data is", data);
              data.name = frnd.name;
              data.leetcode = frnd.leetcode;

              friendData.push(data);

              toast.dismiss();
              toast.info(`Fetching latest data (${i++}/${frndSize})`, {
                autoClose: false,
              });
            }

            updateFriends(friendData);
            setFriends(friendData);

            toast.dismiss();
            toast.info("Data fetched succesfully.");

            setLoading(false);
          } catch (err) {
            // Handle errors
            console.log("error hai re", err);

            toast.dismiss();

            // Show error toast message
            toast.error("Error fetching data");
            setLoading(false);
          }
        }
      } catch (err) {}
    }

    async function initialLoad() {
      if (loading) {
        console.log("I am called loading....");
        await fetchData();
        setLoading(false);
      }
    }

    initialLoad();

    console.log("Friends", friends);
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
          {/* <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md relative">
              Compare
            </button> */}
        </div>
      </div>
      {/* <table className="table-fixed mt-4 mx-8">
          <thead>
            <tr>
              <th className="w-1/12">Username</th>
              <th className="w-1/12">Today</th>
              <th className="w-1/12">Last 7 days</th>
              <th className="w-1/12">Easy</th>
              <th className="w-1/12">Medium</th>
              <th className="w-1/12">Hard</th>
              <th className="w-1/12">Total</th>
              <th className="w-1/12"></th>
            </tr>
          </thead>
          <tbody>
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
        </table> */}

      <div class="overflow-x-auto bg-white shadow-lg rounded-lg mx-24">
        <table class="w-full bg-white border border-gray-200">
          <thead class="bg-gray-800 text-white">
            <tr>
              <th scope="col" class="px-6 py-3 text-left">
                #
              </th>
              <th scope="col" class="px-6 py-3 text-left">
                Username
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left"
                onClick={() => handleSort("today")}
              >
                Today
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left"
                onClick={() => handleSort("last 7 days")}
              >
                Last 7 days
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left"
                onClick={() => handleSort("last 30 days")}
              >
                Last 30 days
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left"
                onClick={() => handleSort("total")}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {/* <tr class="hover:bg-gray-100 cursor-pointer">
                <td class="px-6 py-4">User1</td>
                <td class="px-6 py-4">5</td>
                <td class="px-6 py-4">32</td>
                <td class="px-6 py-4">100</td>
                <td class="px-6 py-4">137</td>
              </tr>
              <tr class="hover:bg-gray-100 cursor-pointer">
                <td class="px-6 py-4">User2</td>
                <td class="px-6 py-4">10</td>
                <td class="px-6 py-4">45</td>
                <td class="px-6 py-4">90</td>
                <td class="px-6 py-4">145</td>
              </tr>
              <tr class="hover:bg-gray-100 cursor-pointer">
                <td class="px-6 py-4">User3</td>
                <td class="px-6 py-4">8</td>
                <td class="px-6 py-4">50</td>
                <td class="px-6 py-4">80</td>
                <td class="px-6 py-4">138</td>
              </tr> */}
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
