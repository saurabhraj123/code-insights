import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from "../../../utils/db";
const User = require("../../../models/User");

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      httpOptions: {
        timeout: 10000, // Increase timeout to 10 seconds
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Connect to the database
        await db.connect();

        // Check if the user already exists
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // If user doesn't exist yet, create a new user record
          console.log(`Creating new user for: ${user.email}`);
          const newUser = new User({
            name: user.name,
            email: user.email,
            friends: [],
          });

          await newUser.save();
          console.log(`User created successfully: ${user.email}`);
        }

        return true;
      } catch (error) {
        console.error("Error in NextAuth signIn callback:", error);
        // Still allow sign in even if there was an error creating the user
        // to prevent locking the user out
        return true;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
