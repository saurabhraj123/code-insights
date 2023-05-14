const axios = require("axios");

class Leetcode {
  async getStats(username) {
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

    console.log("i work here but not below this");

    const variables = { username, limit: 30 };
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

      console.log("response is:", response);

      // Inspect response
      const { errors } = data;
      if (errors) {
        console.log("error is:", errors);
        return { error: "user does not exist" };
      } else {
        return this.decodeGraphqlJson(data);
      }
    } catch (err) {
      console.log("err is", err);
    }
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
      console.log("data", json.data.recentAcSubmissionList);
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
    } catch (ex) {
      console.log("error", ex);
      // return StatsResponse.error('error', ex.message);
    }

    // console.log('success', 'retrieved', totalSolved, totalQuestions, easySolved, totalEasy, mediumSolved, totalMedium, hardSolved, totalHard, acceptanceRate, ranking, contributionPoints, reputation, submissionCalendar)

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

// const statService = new Leetcode()
// statService.getStats('me4saurabh4u');

module.exports.Leetcode = Leetcode;
