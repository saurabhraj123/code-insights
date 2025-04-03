const { Leetcode } = require("../../../utils/scraper");

export default async function handler(req, res) {
  const { slug } = req.query;
  const [site, userName] = slug;
  const forceRefresh = req.query.refresh === "true";

  if (site === "leetcode") {
    try {
      const leetcode = new Leetcode();
      // Pass forceRefresh flag to bypass any caching
      const data = await leetcode.getStats(userName, forceRefresh);

      // Add timestamp to the response
      data.fetchTimestamp = new Date().getTime();

      // Ensure the data includes today's and weekly stats
      if (data && !data.error) {
        // Validate that today and weekly data are present
        if (
          typeof data.solvedToday === "undefined" ||
          typeof data.solvedCurrentWeek === "undefined" ||
          data.solvedToday === 0 ||
          data.solvedCurrentWeek === 0
        ) {
          console.warn(
            `Incomplete or zero stats data for ${userName}, fetching recent activity`
          );

          // If these fields are missing or zero, try fetching them separately
          const recentActivity = await leetcode.getRecentActivity(userName);
          if (recentActivity) {
            // Only override if we got valid values (non-zero or they were undefined before)
            if (
              typeof data.solvedToday === "undefined" ||
              data.solvedToday === 0
            ) {
              data.solvedToday = recentActivity.solvedToday || 0;
            }
            if (
              typeof data.solvedCurrentWeek === "undefined" ||
              data.solvedCurrentWeek === 0
            ) {
              data.solvedCurrentWeek = recentActivity.solvedCurrentWeek || 0;
            }
          }
        }
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(`Error fetching LeetCode stats for ${userName}:`, error);
      return res.status(404).json({
        error: "Leetcode profile not found.",
        message: error.message,
      });
    }
  } else if (site === "gfg") {
    console.log("It is gfg");
  } else if (site === "github") {
    console.log("It is github");
  } else {
    return res.status(404).send("invalid url");
  }

  res.status(200).send(slug);
}
