import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Blog from "../src/models/Blog.js";
import Interaction from "../src/models/Interaction.js";
// import { faker } from "@faker-js/faker";

// Check if faker is installed, otherwise define simple random helpers
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomArrayElement = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/collabwrite";

async function seedAnalytics() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    // 1. Create Users
    console.log("Seeding Users...");
    const users = [];
    for (let i = 0; i < 10; i++) {
      const name = `User ${i + 1}`;
      const email = `user${i + 1}@example.com`;

      // Check if user exists to avoid duplicates
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          password: "password123",
          role: "user",
          bio: "A seeded user for analytics testing.",
          avatar: `https://i.pravatar.cc/150?u=${email}`,
        });
      }
      users.push(user);
    }
    console.log(`Ensured ${users.length} users.`);

    // 2. Create Blogs
    console.log("Seeding Blogs...");
    const categories = [
      "Technology",
      "Lifestyle",
      "Education",
      "Health",
      "Business",
    ];
    const blogs = [];
    for (let i = 0; i < 20; i++) {
      const author = getRandomArrayElement(users);
      const title = `Blog Post ${i + 1}: ${new Date().toISOString()}`;

      // Pick random users for likes
      const likeCount = getRandomInt(0, users.length);
      const likers = [];
      const availableUsers = [...users];
      for (let k = 0; k < likeCount; k++) {
        if (availableUsers.length === 0) break;
        const index = getRandomInt(0, availableUsers.length - 1);
        likers.push(availableUsers[index]._id);
        availableUsers.splice(index, 1);
      }

      let blog = await Blog.create({
        title,
        contentHTML: "<p>This is some dummy content for the blog post.</p>",
        author: author._id,
        status: "published",
        category: getRandomArrayElement(categories),
        tags: ["demo", "analytics", "seed"],
        views: getRandomInt(10, 500),
        likes: likers,
        createdAt: new Date(
          Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000
        ), // Random date in last 30 days
      });
      blogs.push(blog);
    }
    console.log(`Created ${blogs.length} blogs.`);

    // 3. Create Interactions (for DAU chart)
    console.log("Seeding Interactions...");
    const interactionTypes = ["view", "like", "comment", "bookmark"];
    const interactions = [];
    const now = new Date();

    // Generate data for the last 30 days
    for (let d = 0; d < 30; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);

      // Random number of interactions per day (5 to 30)
      const dailyCount = getRandomInt(5, 30);

      for (let k = 0; k < dailyCount; k++) {
        const user = getRandomArrayElement(users);
        const blog = getRandomArrayElement(blogs);

        interactions.push({
          user: user._id,
          target: blog._id,
          targetType: "blog",
          type: getRandomArrayElement(interactionTypes),
          dwellTimeMs: getRandomInt(1000, 30000), // 1s to 30s
          createdAt: date,
        });
      }
    }

    await Interaction.insertMany(interactions);
    console.log(`Created ${interactions.length} interactions.`);

    console.log("Seeding Complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedAnalytics();
