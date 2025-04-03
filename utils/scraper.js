const axios = require("axios");

class Leetcode {
  constructor() {
    // ...existing constructor code...
  }

  async getStats(username, forceRefresh = false) {
    const query = `
  query getUserProfile($username: String!, $limit: Int!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      contributions {
        points
      }
      profile {
        reputation
        ranking
      }
      submissionCalendar
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
    }
  }
`;

    const variables = { username, limit: 50 };
    try {
      const response = await axios.post(
        "https://leetcode.com/graphql/",
        { query, variables },
        {
          headers: {
            referer: `https://leetcode.com/${username}/`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = response;

      const { errors } = data;
      if (errors) {
        return { error: "user does not exist" };
      } else {
        const stats = this.decodeGraphqlJson(data);

        // Extract submissions from the response for calculations
        const recentSubmissions = data?.data?.recentAcSubmissionList || [];
        const formattedSubmissions = recentSubmissions.map((submission) => ({
          problemId: submission.id,
          title: submission.title,
          timestamp: submission.timestamp * 1000, // Convert to milliseconds
        }));

        return {
          ...stats,
          solvedToday: this.calculateSolvedToday(formattedSubmissions),
          solvedCurrentWeek:
            this.calculateSolvedCurrentWeek(formattedSubmissions),
        };
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      return { error: "Failed to fetch user data" };
    }
  }

  // New method to get recent activity data
  async getRecentActivity(username) {
    try {
      const query = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
      }`;

      const variables = { username, limit: 50 };
      const response = await axios.post(
        "https://leetcode.com/graphql/",
        { query, variables },
        {
          headers: {
            referer: `https://leetcode.com/${username}/`,
            "Content-Type": "application/json",
          },
        }
      );

      const recentSubmissions =
        response?.data?.data?.recentAcSubmissionList || [];
      const formattedSubmissions = recentSubmissions.map((submission) => ({
        problemId: submission.id,
        title: submission.title,
        timestamp: submission.timestamp * 1000, // Convert to milliseconds
      }));

      return {
        solvedToday: this.calculateSolvedToday(formattedSubmissions),
        solvedCurrentWeek:
          this.calculateSolvedCurrentWeek(formattedSubmissions),
      };
    } catch (error) {
      console.error(`Error getting recent activity for ${username}:`, error);
      return { solvedToday: 0, solvedCurrentWeek: 0 };
    }
  }

  // Method to get submission data with timestamps
  async getSubmissionData(username, forceRefresh = false) {
    try {
      const query = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
      }`;

      const variables = { username, limit: 50 };
      const response = await axios.post(
        "https://leetcode.com/graphql/",
        { query, variables },
        {
          headers: {
            referer: `https://leetcode.com/${username}/`,
            "Content-Type": "application/json",
          },
        }
      );

      const recentSubmissions =
        response?.data?.data?.recentAcSubmissionList || [];
      return recentSubmissions.map((submission) => ({
        problemId: submission.id,
        title: submission.title,
        timestamp: submission.timestamp * 1000, // Convert to milliseconds
      }));
    } catch (error) {
      console.error(`Error getting submission data for ${username}:`, error);
      return [];
    }
  }

  // Calculate problems solved today
  calculateSolvedToday(submissions) {
    if (!submissions || !Array.isArray(submissions)) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const uniqueProblemsSolvedToday = new Set();

    submissions.forEach((submission) => {
      const submissionDate = new Date(submission.timestamp);
      if (submissionDate >= today) {
        uniqueProblemsSolvedToday.add(submission.problemId);
      }
    });

    return uniqueProblemsSolvedToday.size;
  }

  // Calculate problems solved in the last 7 days
  calculateSolvedCurrentWeek(submissions) {
    if (!submissions || !Array.isArray(submissions)) return 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const uniqueProblemsSolvedThisWeek = new Set();

    submissions.forEach((submission) => {
      const submissionDate = new Date(submission.timestamp);
      if (submissionDate >= sevenDaysAgo) {
        uniqueProblemsSolvedThisWeek.add(submission.problemId);
      }
    });

    return uniqueProblemsSolvedThisWeek.size;
  }

  decodeGraphqlJson(json) {
    let totalSolved = 0;
    let totalQuestions = 0;
    let easySolved = 0;
    let totalEasy = 0;
    let mediumSolved = 0;
    let totalMedium = 0;
    let hardSolved = 0;
    let totalHard = 0;
    let acceptanceRate = 0;
    let ranking = 0;
    let contributionPoints = 0;
    let reputation = 0;

    const submissionCalendar = {};
    let recentSubmissions = {};

    try {
      const allQuestions = json.data.allQuestionsCount;
      const matchedUser = json.data.matchedUser;
      const submitStats = matchedUser.submitStats;
      recentSubmissions = json.data.recentAcSubmissionList;
      const actualSubmissions = submitStats.acSubmissionNum;
      const totalSubmissions = submitStats.totalSubmissionNum;

      // Fill in total counts
      totalQuestions = allQuestions[0].count;
      totalEasy = allQuestions[1].count;
      totalMedium = allQuestions[2].count;
      totalHard = allQuestions[3].count;

      // Fill in solved counts
      totalSolved = actualSubmissions[0].count;
      easySolved = actualSubmissions[1].count;
      mediumSolved = actualSubmissions[2].count;
      hardSolved = actualSubmissions[3].count;

      // Fill in etc
      const totalAcceptCount = actualSubmissions[0].submissions;
      const totalSubCount = totalSubmissions[0].submissions;
      if (totalSubCount !== 0) {
        acceptanceRate = ((totalAcceptCount / totalSubCount) * 100).toFixed(2);
      }

      contributionPoints = matchedUser.contributions.points;
      reputation = matchedUser.profile.reputation;
      ranking = matchedUser.profile.ranking;

      const submissionCalendarJson = JSON.parse(matchedUser.submissionCalendar);

      Object.keys(submissionCalendarJson).forEach((timeKey) => {
        submissionCalendar[timeKey] = submissionCalendarJson[timeKey];
      });
    } catch (ex) {}

    return {
      totalSolved,
      totalQuestions,
      easySolved,
      totalEasy,
      mediumSolved,
      totalMedium,
      hardSolved,
      totalHard,
      acceptanceRate,
      ranking,
      contributionPoints,
      reputation,
      submissionCalendar,
      recentSubmissions,
    };
  }
}

module.exports = {
  Leetcode,
  // ...other exports...
};
