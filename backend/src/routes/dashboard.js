// ── Dashboard Routes ─────────────────────────────────────────────────
// Analytics and statistics endpoints

const express = require("express");
const { authenticate, authorize } = require("../middleware");
const DashboardService = require("../services/dashboardService");

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin", "scrutiny_team", "mom_team"));

// ── Overview statistics ──────────────────────────────────────────────
router.get("/overview", async (_req, res, next) => {
  try {
    const stats = await DashboardService.getOverview();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ── By category breakdown ────────────────────────────────────────────
router.get("/by-category", async (_req, res, next) => {
  try {
    const data = await DashboardService.byCategory();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ── By sector breakdown ──────────────────────────────────────────────
router.get("/by-sector", async (_req, res, next) => {
  try {
    const data = await DashboardService.bySector();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ── Monthly trend ────────────────────────────────────────────────────
router.get("/monthly-trend", async (_req, res, next) => {
  try {
    const data = await DashboardService.monthlyTrend();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
