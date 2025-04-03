import { Leetcode } from "../../../utils/scraper";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const {
    usernames,
    metrics = ["totalSolved", "easySolved", "mediumSolved", "hardSolved"],
  } = req.body;

  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: "Invalid usernames array" });
  }

  try {
    const leetcode = new Leetcode();
    const results = {};
    const fetchTime = new Date().getTime();

    // Fetch stats for each user in parallel
    const statsPromises = usernames.map(async (username) => {
      try {
        // Get clean username without leetcode.com/ prefix
        const cleanUsername = username.includes("/")
          ? username.split("/").pop()
          : username;

        const stats = await leetcode.getStats(cleanUsername);

        // Add fetch timestamp to the stats
        if (stats && !stats.error) {
          stats.fetchTimestamp = fetchTime;
          stats.username = cleanUsername;

          // Filter only requested metrics
          const filteredStats = {};
          metrics.forEach((metric) => {
            if (stats[metric] !== undefined) {
              filteredStats[metric] = stats[metric];
            }
          });

          return { username: cleanUsername, stats: filteredStats };
        }

        return {
          username: cleanUsername,
          stats: { error: "Failed to fetch data", username: cleanUsername },
        };
      } catch (error) {
        console.error(`Error fetching stats for ${username}:`, error);
        return {
          username: username.includes("/")
            ? username.split("/").pop()
            : username,
          stats: { error: "Failed to fetch data" },
        };
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
    console.error("Error in comparison stats API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
