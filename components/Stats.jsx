import React, { useEffect, useState } from "react";
import StatRow from "./StatRow";
import AddFriendPopup from "./AddFriendPopup";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function Stats() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFriendPopup, setShowFriendPopup] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();

  const handlePopup = (val) => {
    setShowFriendPopup(val);
  };

  useEffect(() => {
    async function updateFriends(updatedFriends) {
      const { email } = session.user;
      const { data } = await axios.put(
        `http://localhost:3000/api/user/${email}`,
        { friends: updatedFriends }
      );

      console.log("friends updated");
    }

    async function getData() {
      const { email } = session.user;

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
          // setLoading(false);

          const frnds = data.user.friends;
          console.log("friends is", frnds);

          const frndSize = frnds.length;

          if (friends.length === frndSize) return;

          try {
            const friendData = [];

            for (const frnd of frnds) {
              // await delay(1000); // Delay of 1 second between each request (adjust as needed)

              const username = frnd.leetcode.split("/")[3];
              const { data } = await axios.get(
                `http://localhost:3000/api/stats/leetcode/${username}`
              );

              console.log("friend data is", data);
              data.name = frnd.name;
              data.leetcode = frnd.leetcode;

              friendData.push(data);
            }

            // const updatedFriends = [...friends, ...friendData];
            updateFriends(friendData);

            setFriends(friendData);
          } catch (err) {
            // Handle errors
            console.log("error hai re", err);
          }
        }
      } catch (err) {}
    }

    if (loading) {
      getData();
      setLoading(false);
    } else {
      // setLoading(true);
    }
    console.log("Friends", friends);
  }, [loading, showFriendPopup]);

  const handleClickRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleLoading = (val) => {
    setLoading(val);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Tracker</h2>
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
          <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md">
            Compare
          </button>

          <p>Doston: {friends.length}</p>
        </div>
      </div>
      <table className="w-full table-fixed">
        <thead>
          <tr>
            <th className="w-1/12">Username</th>
            <th className="w-1/12">Today</th>
            <th className="w-1/12">Last 7 days</th>
            <th className="w-1/12">
              Easy - {friends.length && friends[0].totalEasy}
            </th>
            <th className="w-1/12">
              Medium - {friends.length && friends[0].totalMedium}
            </th>
            <th className="w-1/12">
              Hard - {friends.length && friends[0].totalHard}
            </th>
            <th className="w-1/12">
              Total - {friends.length && friends[0].totalQuestions}
            </th>
            <th className="w-1/12"></th>
          </tr>
        </thead>
        <tbody>
          {/* {data.map((user, index) => (
            <StatRow
              key={index}
              user={user}
              index={index}
              expandedRow={expandedRow}
              handleClickRow={handleClickRow}
            />
          ))} */}

          {friends.map((friend, index) => {
            return (
              <StatRow
                key={index}
                user={friend}
                index={index}
                expandedRow={expandedRow}
                handleClickRow={handleClickRow}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
