// Creates the initial Admin and Super Admin accounts directly (bypassing
// the setup-key-gated API endpoints, since this only ever runs locally
// by whoever holds the database credentials).
//
// Run once: npm run seed:admins
//
// IMPORTANT: change both passwords after first login. These are strong,
// randomly generated values meant only to get you started — nobody
// besides you should ever see them beyond this file/handoff.
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../models/User.js";

const ACCOUNTS = [
  {
    name: "Bk_Bakers Admin",
    email: "admin@bkbakers.com",
    phone: "03000000001",
    password: "admin123",
    role: "admin",
  },
  {
    name: "The Developer",
    email: "developer@bkbakers.com",
    phone: "03000000000",
    password: "sadmin123",
    role: "superadmin",
  },
];

const run = async () => {
  await connectDB();

  for (const account of ACCOUNTS) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      console.log(
        `Skipped (already exists): ${account.email} [${account.role}]`,
      );
      continue;
    }
    await User.create(account); // password is hashed by the User model's pre-save hook
    console.log(`Created: ${account.email} [${account.role}]`);
  }

  console.log("\nDone. Log in at /admin/login with either account.");
  console.log("Please change both passwords after your first login.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding admins failed:", err);
  process.exit(1);
});
