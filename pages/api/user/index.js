const User = require("../../../models/User");
const db = require("../../../utils/db");
const axios = require("axios");

export default async function handler(req, res) {
  if (req.method == "POST") {
    await db.connect();

    const { name, email, leetcode, gfg } = req.body;

    const leetcodeUsername = extractUsername(leetcode);
    try {
      const response = await axios.get(
        `https://leetcode.com/${leetcodeUsername}`
      );
    } catch (err) {
      console.log("response status is", err);

      if (err) {
        return res.status(404).send("Leetcode Profile is not valid.");
      }
    }

    // if (!response.data) {
    //   return res.status(404).json({ error: "Invalid URL" });
    // }

    const friends = [];
    const { data } = await axios.get(
      `${process.env.BACKEND_URI}/api/stats/leetcode/${leetcodeUsername}`
    );

    data.name = name;
    data.leetcode = leetcode;
    friends.push(data);

    console.log("friends data is:", data);

    const user = new User({
      name,
      email,
      leetcode,
      gfg,
      friends,
    });

    try {
      const savedUser = await user.save();
      res.status(201).json({ message: "User created", user: savedUser });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

function extractUsername(url) {
  const pattern = /https:\/\/leetcode\.com\/([^/]+)/;
  const match = url.match(pattern);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}
