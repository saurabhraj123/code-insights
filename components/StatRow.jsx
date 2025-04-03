import React, { useEffect, useState, forwardRef } from "react";

const StatRow = forwardRef(
  (
    {
      user,
      index,
      expandedRow,
      handleClickRow,
      className,
      style = {},
      ...props
    },
    ref
  ) => {
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
          ref={ref}
          className={`hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${
            className || ""
          } ${expandedRow === index ? "!bg-blue-50" : ""}`}
          style={{
            ...style,
            ...(expandedRow === index
              ? { borderLeft: "4px solid #3b82f6" }
              : {}),
          }}
          onClick={() => handleClickRow(index)}
          {...props}
        >
          <td className="px-6 py-4 font-normal text-gray-500 text-sm w-12">
            {index + 1}
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="mr-2 flex-shrink-0 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-grip-vertical"
                  viewBox="0 0 16 16"
                >
                  <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                </svg>
              </div>
              <a
                href={user.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                {user.name}
              </a>
            </div>
          </td>
          <td className="px-6 py-4 text-center">
            <div
              className={`inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 rounded-full ${
                solvedToday > 0
                  ? "bg-green-100 text-green-800 ring-1 ring-green-400"
                  : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
              }`}
            >
              {solvedToday}
              {solvedToday >= 20 && <span className="text-sm">+</span>}
            </div>
          </td>
          <td className="px-6 py-4 text-center">
            <div
              className={`inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 rounded-full ${
                solvedCurrentWeek > 0
                  ? "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400"
                  : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
              }`}
            >
              {solvedCurrentWeek}
              {solvedCurrentWeek >= 20 && (
                <span className="text-xs ml-1">+</span>
              )}
            </div>
          </td>
          <td className="px-6 py-4 text-center font-medium text-gray-800">
            <div className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 rounded-full bg-gray-50 ring-1 ring-gray-300">
              {user.totalSolved}
            </div>
          </td>
        </tr>
        {expandedRow === index && (
          <tr>
            <td colSpan="6" className="p-0">
              <div className="bg-blue-50 p-6 border-t border-b border-blue-100">
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  Problem Solving Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        Easy
                      </span>
                      <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {user.easySolved}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (user.easySolved / user.totalSolved) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        Medium
                      </span>
                      <span className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {user.mediumSolved}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (user.mediumSolved / user.totalSolved) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">
                        Hard
                      </span>
                      <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {user.hardSolved}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (user.hardSolved / user.totalSolved) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }
);

StatRow.displayName = "StatRow";

export default StatRow;
