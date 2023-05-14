const User = require("../../../models/User");
const db = require("../../../utils/db");
const axios = require("axios");

export default async (req, res) => {
  if (req.method == "GET") {
    const { email } = req.query;

    await db.connect();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ error: "user not found" });
    }
    res.status(200).json({ user });
  } else if (req.method === "PUT") {
    await db.connect();

    const { email } = req.query;
    const { name, leetcode, friend, friends } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found or email is incorrect" });
      }

      if (friends) {
        const updateFields = {};
        updateFields.friends = friends;

        try {
          const updatedUser = await User.findOneAndUpdate(
            { email: email },
            updateFields,
            { new: true }
          );
          return res.status(200).send(updatedUser);
        } catch (err) {
          console.log("err is:", err);
          return res.status(404).send("Something went wrong");
        }
      }

      // if (user.leetcode === friend.leetcode) {
      //   return res.status(409).send("Profile already exist.");
      // }

      const oldFriends = [...user.friends];
      const isOldFriend = oldFriends.find((oldFriend) => {
        return oldFriend.leetcode === friend.leetcode;
      });

      if (isOldFriend) {
        return res.status(409).send("Profile already exist");
      }

      try {
        const profile = friend.leetcode.split("/").pop();
        const res = await axios.get(
          `http://localhost:3000/api/stats/leetcode/${profile}`
        );

        if (res.data.error) {
          return res.status(404).send("Leetcode profile doesn't exist.");
        }
        console.log("I am here bro", res.data.error);

        // await validateLeetcodeProfile(friend.leetcode);
        const { data } = res;
        console.log("my friends data is:", data);
        const updateFields = {};

        if (name) updateFields.name = name;
        if (leetcode) updateFields.leetcode = leetcode;
        if (friend && data) {
          data.name = friend.name;
          data.leetcode = friend.leetcode;
          updateFields.friends = [...user.friends, data];
        }

        const updatedUser = await User.findOneAndUpdate(
          { email: email },
          updateFields,
          { new: true }
        );

        return res
          .status(200)
          .json({ message: "User updated", user: updatedUser });
      } catch (err) {
        console.log("error aa gya re baba", err);
        return res.send("Leetcode profile doesn't exist.");
      }
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
};
