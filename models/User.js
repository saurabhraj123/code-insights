const mongoose = require("mongoose");

const RecentSubmissionSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  titleSlug: { type: String },
  timestamp: { type: String },
});

// users collection schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  leetcode: { type: String },
  friends: [
    {
      name: { type: String, required: true },
      leetcode: { type: String, required: true },
      totalSolved: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      totalEasy: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      totalMedium: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      totalHard: { type: Number, default: 0 },
      totalMedium: { type: Number, default: 0 },
      totalMedium: { type: Number, default: 0 },
      recentSubmissions: { type: [RecentSubmissionSchema], default: [] },
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
