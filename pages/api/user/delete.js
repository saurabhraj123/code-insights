import db from "../../../utils/db";

export default async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    // Ensure proper database connection
    await db.connect();

    // Using the direct import might be causing issues
    // Import User model dynamically to avoid timing issues with mongoose
    const User = require("../../../models/User");

    // Log the email being deleted for debugging
    console.log(`Attempting to delete user with email: ${email}`);

    // Find and delete the user
    const result = await User.findOneAndDelete({ email });

    if (!result) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`Successfully deleted user: ${email}`);
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    // Detailed error logging
    console.error("Error deleting user account:", error);
    console.error("Error stack:", error.stack);

    // Send more descriptive error to help debugging
    return res.status(500).json({
      error: "Failed to delete account",
      message: error.message,
      details: error.stack,
    });
  } finally {
    // Ensure connection is properly handled
    // db.disconnect() if needed
  }
}
