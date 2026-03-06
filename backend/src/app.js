require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const config = require("./config");
const { sequelize } = require("./models");
const logger = require("./utils/logger");

const app = express();

// ── Security Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ── Body Parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ── Ensure upload directory exists ───────────────────────────────────
if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

// ── API Routes ───────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/scrutiny", require("./routes/scrutiny"));
app.use("/api/meetings", require("./routes/meetings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/config", require("./routes/config"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 Handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error(err.message, { stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({
    error:
      config.env === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ── Start Server ─────────────────────────────────────────────────────
async function start() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Database connection established successfully.");

    // Sync models in development (migrations used in production)
    if (config.env === "development") {
      await sequelize.sync({ alter: true });
      logger.info("Database models synced.");
    }

    app.listen(config.port, () => {
      logger.info(
        `PARIVESH 3.0 API running on port ${config.port} [${config.env}]`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

module.exports = app;
