import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Fail fast and loudly rather than booting into a broken, insecure
// state — a missing JWT secret or DB URI is a deployment mistake, not
// something to silently limp along without.
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variable(s): ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill these in before starting the server.");
  process.exit(1);
}

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `Cake platform API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });

  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Platforms like Render/Railway send SIGTERM on redeploy/scale-down —
  // finish in-flight requests instead of dropping them mid-order.
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });
};

start();
