import { Leetcode } from "../../../utils/scraper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { usernames, forceRefresh } = req.body;

  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: "Invalid usernames array" });
  }

  try {
    const leetcode = new Leetcode();
    const results = {};
    const fetchTime = new Date().getTime(); // Add timestamp when the fetch happened

    // Fetch stats for each user in parallel
    const statsPromises = usernames.map(async (username) => {
      try {
        const stats = await leetcode.getStats(username, forceRefresh);

        // Add fetch timestamp to the stats
        if (stats && !stats.error) {
          stats.fetchTimestamp = fetchTime;

          // If stats were returned but activity metrics are zero, try to get them separately
          if (stats.solvedToday === 0 || stats.solvedCurrentWeek === 0) {
            const recentActivity = await leetcode.getRecentActivity(username);
            if (recentActivity) {
              if (stats.solvedToday === 0) {
                stats.solvedToday = recentActivity.solvedToday || 0;
              }
              if (stats.solvedCurrentWeek === 0) {
                stats.solvedCurrentWeek = recentActivity.solvedCurrentWeek || 0;
              }
            }
          }
        }

        return { username, stats };
      } catch (error) {
        console.error(`Error fetching stats for ${username}:`, error);
        return { username, stats: { error: "Failed to fetch data" } };
      }
    });

    const statsResults = await Promise.all(statsPromises);

    // Convert array of results to object with usernames as keys
    statsResults.forEach(({ username, stats }) => {
      results[username] = stats;
    });

    // Add overall timestamp to response
    results.timestamp = fetchTime;

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in batch stats API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
