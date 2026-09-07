// src/app.ts
import "./config/env"; // load env first
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoute from "./modules/auth/auth.route";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { env } from "./config/env";
import usersRoute from "./modules/users/users.route";
import vendorsRoute from "./modules/vendors/vendors.route";
import productsRoute from "./modules/products/products.route";
import categoriesRoute from "./modules/categories/categories.route";
import cartRoute from "./modules/cart/cart.route";
const app = express();

// ── Security middlewares ──────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// ── Rate limiting ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200,
  message: {
    success: false,
    message: "Quá nhiều request, vui lòng thử lại sau",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // giới hạn 10 lần login/register mỗi 15 phút
  message: {
    success: false,
    message: "Quá nhiều lần thử, vui lòng thử lại sau 15 phút",
  },
});

app.use(globalLimiter);

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// ── Logger ────────────────────────────────────────────────────
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Herbal Shop API is running 🌿",
    env: env.NODE_ENV,
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoute);
app.use("/api/users", usersRoute);
app.use("/api/vendors", vendorsRoute);
app.use("/api/products", productsRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/cart", cartRoute);
// Các modules tiếp theo sẽ thêm vào đây:

// app.use('/api/orders', orderRoute)
// app.use('/api/payments', paymentRoute)
// app.use('/api/reviews', reviewRoute)

// ── Error handlers ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`🌿 Herbal Shop API running on http://localhost:${env.PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
});

export default app;
