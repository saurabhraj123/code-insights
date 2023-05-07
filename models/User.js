const mongoose = require("mongoose");

// users collection schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  leetcode: { type: String },
  gfg: { type: String },
  friends: [
    {
      name: { type: String, required: true },
      leetcode: { type: String },
      gfg: { type: String },
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
