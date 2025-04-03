import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Custom colors
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function CompareChart({ mainUser, compareUsers, data }) {
  const [chartType, setChartType] = useState("bar");

  // Format data for charts
  const formatDataForBarChart = () => {
    return [
      {
        name: "Total Solved",
        [mainUser.name]: mainUser.totalSolved,
        ...compareUsers.reduce(
          (acc, user) => ({ ...acc, [user.name]: user.totalSolved }),
          {}
        ),
      },
      {
        name: "Easy",
        [mainUser.name]: mainUser.easySolved,
        ...compareUsers.reduce(
          (acc, user) => ({ ...acc, [user.name]: user.easySolved }),
          {}
        ),
      },
      {
        name: "Medium",
        [mainUser.name]: mainUser.mediumSolved,
        ...compareUsers.reduce(
          (acc, user) => ({ ...acc, [user.name]: user.mediumSolved }),
          {}
        ),
      },
      {
        name: "Hard",
        [mainUser.name]: mainUser.hardSolved,
        ...compareUsers.reduce(
          (acc, user) => ({ ...acc, [user.name]: user.hardSolved }),
          {}
        ),
      },
    ];
  };

  // Calculate difficulty distribution for pie charts
  const calculateDifficultyDistribution = (user) => {
    return [
      { name: "Easy", value: user.easySolved },
      { name: "Medium", value: user.mediumSolved },
      { name: "Hard", value: user.hardSolved },
    ];
  };

  const renderBarChart = () => {
    const barData = formatDataForBarChart();
    const allUsers = [mainUser, ...compareUsers];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={barData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {allUsers.map((user, index) => (
            <Bar
              key={user.name}
              dataKey={user.name}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieCharts = () => {
    const allUsers = [mainUser, ...compareUsers];

    return (
      <div className="w-full max-h-[400px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allUsers.map((user, userIndex) => {
            const data = calculateDifficultyDistribution(user);

            return (
              <div
                key={user.name}
                className="text-center flex flex-col items-center justify-center py-4"
              >
                <h3 className="text-lg font-semibold mb-3">{user.name}</h3>
                <div className="w-full flex justify-center">
                  {/* Increased width and height for more room for labels */}
                  <PieChart width={230} height={260}>
                    <Pie
                      data={data}
                      cx={115}
                      cy={100}
                      labelLine={false} // Removed the label lines for cleaner look
                      outerRadius={65}
                      fill="#8884d8"
                      dataKey="value"
                      // Simplified label to just show percentages, moving the problem type to the legend below
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x =
                          cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                        const y =
                          cy + radius * Math.sin((-midAngle * Math.PI) / 180);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontWeight="bold"
                            fontSize="12"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Problems Solved"]}
                    />
                  </PieChart>
                </div>
                {/* Enhanced problem breakdown with colored indicators */}
                <p className="mt-4">Total: {user.totalSolved} problems</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm w-full">
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-1"></div>
                    <span className="text-gray-700">
                      Easy: {user.easySolved}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#00C49F] mr-1"></div>
                    <span className="text-gray-700">
                      Med: {user.mediumSolved}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#FFBB28] mr-1"></div>
                    <span className="text-gray-700">
                      Hard: {user.hardSolved}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              chartType === "bar"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setChartType("bar")}
          >
            Bar Chart
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              chartType === "pie"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setChartType("pie")}
          >
            Pie Charts
          </button>
        </div>
      </div>

      {/* Fixed height container to prevent layout shift */}
      <div className="chart-container mb-8" style={{ minHeight: "400px" }}>
        {chartType === "bar" && renderBarChart()}
        {chartType === "pie" && renderPieCharts()}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Analysis</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
          <p className="mb-2">
            <strong>Problem Solving Comparison:</strong> {mainUser.name} has
            solved {mainUser.totalSolved} problems in total
            {compareUsers.map((user, i) => (
              <span key={i}>
                {i === 0
                  ? " compared to "
                  : i === compareUsers.length - 1
                  ? " and "
                  : ", "}
                {user.totalSolved} by {user.name}
              </span>
            ))}
            .
          </p>

          <p className="mb-2">
            <strong>Difficulty Distribution:</strong> {mainUser.name} has solved{" "}
            {mainUser.easySolved} easy,
            {mainUser.mediumSolved} medium, and {mainUser.hardSolved} hard
            problems.
          </p>

          {mainUser.totalSolved > 0 && (
            <p className="mb-2">
              <strong>Focus Areas:</strong> {mainUser.name} focuses most on{" "}
              {mainUser.easySolved >= mainUser.mediumSolved &&
              mainUser.easySolved >= mainUser.hardSolved
                ? "easy problems"
                : mainUser.mediumSolved >= mainUser.hardSolved
                ? "medium problems"
                : "hard problems"}
              .
            </p>
          )}

          <p>
            <strong>Performance Comparison:</strong> In terms of problem-solving
            efficiency:
            {(() => {
              const allUsers = [mainUser, ...compareUsers];
              const totalRanking = [...allUsers].sort(
                (a, b) => b.totalSolved - a.totalSolved
              );
              const hardRanking = [...allUsers].sort(
                (a, b) => b.hardSolved - a.hardSolved
              );

              return (
                <ul className="list-disc ml-6 mt-1">
                  <li>
                    {totalRanking[0].name} has the highest total solved (
                    {totalRanking[0].totalSolved} problems)
                  </li>
                  <li>
                    {hardRanking[0].name} has solved the most hard problems (
                    {hardRanking[0].hardSolved})
                  </li>
                </ul>
              );
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
