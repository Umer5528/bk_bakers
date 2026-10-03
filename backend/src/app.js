import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import cloudinary from "./config/cloudinary.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import schedulingRoutes from "./routes/schedulingRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import timeSlotRoutes from "./routes/timeSlotRoutes.js";
import blockedDateRoutes from "./routes/blockedDateRoutes.js";
import customOrderRoutes from "./routes/customOrderRoutes.js";
import paymentAccountRoutes from "./routes/paymentAccountRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import errorHandler, { notFound } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Render/Vercel/Railway/Heroku all sit the app behind a reverse proxy —
// without this, express-rate-limit and req.ip see the proxy's IP for
// every request instead of the real client, making rate limiting
// useless in production.
app.set("trust proxy", 1);

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api", apiLimiter);

// --- Health check ---
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

// --- Routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/scheduling", schedulingRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/time-slots", timeSlotRoutes);
app.use("/api/v1/blocked-dates", blockedDateRoutes);
app.use("/api/v1/custom-orders", customOrderRoutes);
app.use("/api/v1/payment-accounts", paymentAccountRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/gallery", galleryRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);
app.get("/api/v1/cloudinary-test", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();

    res.status(200).json({
      success: true,
      message: "Cloudinary authentication works",
      result,
    });
  } catch (error) {
    console.error("CLOUDINARY PING ERROR:", error);

    res.status(500).json({
      success: false,
      message: error?.message || "Cloudinary ping failed",
      http_code: error?.http_code || null,
      name: error?.name || null,
    });
  }
});
export default app;
