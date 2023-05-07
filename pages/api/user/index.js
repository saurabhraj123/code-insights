const User = require("../../../models/User");
const db = require("../../../utils/db");

export default async function handler(req, res) {
  if (req.method == "POST") {
    await db.connect();

    const { name, email, leetcode, gfg } = req.body;

    const user = new User({
      name,
      email,
      leetcode,
      gfg,
    });

    try {
      const savedUser = await user.save();
      res.status(201).json({ message: "User created", user: savedUser });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}
