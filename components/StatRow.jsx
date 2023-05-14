import React, { useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";

export default function StatRow({ user, index, expandedRow, handleClickRow }) {
  const [solvedToday, setSolvedToday] = useState(0);
  const [solvedCurrentWeek, setSolvedCurrentWeek] = useState(0);
  const [loading, setLoading] = useState(true);

  function isTimestampForCurrentDay(timestamp) {
    // Get the current date and time in milliseconds
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();

    // Get the start of the current day by setting the time to 00:00:00
    const startOfDayTimestamp = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).getTime();

    // Compare the provided timestamp with the start of the current day
    return timestamp >= startOfDayTimestamp && timestamp < currentTimestamp;
  }

  function isTimestampForCurrentWeek(timestamp) {
    // Get the current timestamp
    const currentTimestamp = Date.now();

    // Calculate the timestamp for 7 days ago
    const weekAgoTimestamp = currentTimestamp - 7 * 24 * 60 * 60 * 1000;

    // Compare the provided timestamp with the timestamp from 7 days ago
    return timestamp >= weekAgoTimestamp && timestamp <= currentTimestamp;
  }

  useEffect(() => {
    const recentSubmissions = user.recentSubmissions;
    // console.log("recent", recentSubmissions);

    let todaySubmissions = 0,
      weeklySubmissions = 0;
    if (recentSubmissions) {
      if (recentSubmissions.length) {
        todaySubmissions = recentSubmissions.reduce((a, c) => {
          if (isTimestampForCurrentDay(c.timestamp * 1000)) return a + 1;

          return a;
        }, 0);

        weeklySubmissions = recentSubmissions.reduce((a, c) => {
          if (isTimestampForCurrentWeek(c.timestamp * 1000)) return a + 1;

          return a;
        }, 0);
      }
    }

    if (loading) {
      setSolvedToday(todaySubmissions);
      setSolvedCurrentWeek(weeklySubmissions);
      setLoading(false);
    }
  }, [loading]);

  return (
    <React.Fragment key={index}>
      <tr className="hover:bg-gray-100" onClick={() => handleClickRow(index)}>
        <td className="py-2 pl-4 pr-2 flex gap-2 items-center">
          <a href={user.leetcode} target="_blank">
            {user.name}
          </a>
          <ArrowUpRightIcon className="h-3 w-3" />
        </td>
        <td className="py-2 text-center">{solvedToday}</td>
        <td className="py-2 text-center">{solvedCurrentWeek}</td>
        <td className="py-2 text-center">{user.easySolved}</td>
        <td className="py-2 text-center">{user.mediumSolved}</td>
        <td className="py-2 text-center">{user.hardSolved}</td>
        <td className="py-2 text-center">{user.totalSolved}</td>
        <td className="py-2 text-center">
          <ChevronDownIcon
            className={`h-5 w-5 ${
              expandedRow === index ? "transform rotate-180" : ""
            }`}
          />
        </td>
      </tr>
      {expandedRow === index && (
        <tr>
          <td colSpan="8" className="p-4">
            <div className="grid grid-cols-2 gap-8 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">
                  Leetcode details
                </h4>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Difficulty</th>
                      <th className="text-right">Solved</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">Easy</td>
                      <td className="py-2 text-right">{user.easySolved}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Medium</td>
                      <td className="py-2 text-right">{user.mediumSolved}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Hard</td>
                      <td className="py-2 text-right">{user.hardSolved}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Last 30 days activity
              </h4>
              {/* <LineChart data={user.last30Days} /> */}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
