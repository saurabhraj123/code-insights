/**
 * Extract LeetCode username from a LeetCode profile URL
 * @param {string} url - LeetCode profile URL
 * @returns {string|null} - Extracted username or null if invalid
 */
export function extractUsername(url) {
  if (!url) return null;

  try {
    // Handle different URL formats
    const pattern = /https:\/\/leetcode\.com\/([^/]+)/;
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }

    // If it's just a username without URL
    if (!url.includes("leetcode.com") && !url.includes("/")) {
      return url;
    }

    return null;
  } catch (error) {
    console.error("Error extracting username:", error);
    return null;
  }
}

/**
 * Check if a LeetCode profile exists
 * @param {string} username - LeetCode username
 * @returns {Promise<boolean>} - Whether the profile exists
 */
export async function checkProfileExists(username) {
  if (!username) return false;

  try {
    const { Leetcode } = require("./scraper");
    const leetcode = new Leetcode();
    await leetcode.getStats(username);
    return true;
  } catch (error) {
    return false;
  }
}
