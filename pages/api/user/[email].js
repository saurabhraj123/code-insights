const User = require("../../../models/User");
const db = require("../../../utils/db");

export default async (req, res) => {
  const { email } = req.query;

  await db.connect();
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ error: "user not found" });
  }
  res.status(200).json({ user });
};
