import React, { useEffect, useState } from "react";

export default function StatRow({ user, index, expandedRow, handleClickRow }) {
  const [solvedToday, setSolvedToday] = useState(0);
  const [solvedCurrentWeek, setSolvedCurrentWeek] = useState(0);
  const [solvedCurrentMonth, setSolvedCurrentMonth] = useState(0);

  function isTimestampForCurrentDay(timestamp) {
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();

    const startOfDayTimestamp = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).getTime();

    return timestamp >= startOfDayTimestamp && timestamp < currentTimestamp;
  }

  function isTimestampForCurrentWeek(timestamp) {
    const currentTimestamp = Date.now();
    const weekAgoTimestamp = currentTimestamp - 7 * 24 * 60 * 60 * 1000;
    return timestamp >= weekAgoTimestamp && timestamp <= currentTimestamp;
  }

  function isTimeStampForCurrentMonth(timestamp) {
    const currentTimestamp = Date.now();
    const monthAgoTimestamp = currentTimestamp - 30 * 24 * 60 * 60 * 1000;

    return (
      timestamp >= monthAgoTimestamp && monthAgoTimestamp <= currentTimestamp
    );
  }

  useEffect(() => {
    const recentSubmissions = user.recentSubmissions;

    let todaySubmissions = 0,
      weeklySubmissions = 0,
      monthlySubmissions = 0;
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

        monthlySubmissions = recentSubmissions.reduce((a, c) => {
          if (isTimeStampForCurrentMonth(c.timestamp * 1000)) return a + 1;

          return a;
        }, 0);
      }
    }

    setSolvedToday(todaySubmissions);
    setSolvedCurrentWeek(weeklySubmissions);
    setSolvedCurrentMonth(monthlySubmissions);
  });

  return (
    <React.Fragment key={index}>
      <tr
        className="hover:bg-gray-100 cursor-pointer"
        onClick={() => handleClickRow(index)}
      >
        <td className="px-6 py-4 text font-bold">{index + 1}</td>
        <td className="px-6 py-2 flex ">
          <a href={user.leetcode} target="_blank">
            {user.name}
          </a>
        </td>
        <td className="px-6 py-4 text-center">
          {solvedToday}
          {solvedToday >= 20 && <span className="text-sm">+</span>}
        </td>
        <td className="flex items-center justify-center px-6 py-4 text-center">
          {solvedCurrentWeek}
          {solvedCurrentWeek >= 20 && <span className="flex text-xs">+</span>}
        </td>
        <td className="px-6 py-4 text-center">{user.totalSolved}</td>
      </tr>
      {expandedRow === index && (
        <tr>
          <td colSpan="6" className="px-4 py-4">
            <div className=" bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <h4 className="text-lg font-medium text-gray-800">
                  More Details:
                </h4>
              </div>
              <div className="border-t border-gray-200 p-4">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-2 text-left">Difficulty</th>
                      <th className="px-6 py-2 text-right">Solved</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-2">Easy</td>
                      <td className="px-6 py-2 text-right">
                        {user.easySolved}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">Medium</td>
                      <td className="px-6 py-2 text-right">
                        {user.mediumSolved}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">Hard</td>
                      <td className="px-6 py-2 text-right">
                        {user.hardSolved}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
