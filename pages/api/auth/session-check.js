import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import db from "../../../utils/db";
const User = require("../../../models/User");

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await db.connect();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      // If user doesn't exist in DB despite having a session, create them
      const newUser = new User({
        name: session.user.name,
        email: session.user.email,
        friends: [],
      });

      await newUser.save();
      return res.status(201).json({
        message: "User was just created",
        user: {
          name: session.user.name,
          email: session.user.email,
        },
      });
    }

    return res.status(200).json({
      message: "User exists",
      user: {
        name: user.name,
        email: user.email,
        friendsCount: user.friends ? user.friends.length : 0,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
