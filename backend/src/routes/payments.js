// ── Payment Routes ───────────────────────────────────────────────────
// Initiate, confirm, list payments

const express = require("express");
const { body, param, query } = require("express-validator");
const { authenticate, authorize, validate } = require("../middleware");
const PaymentService = require("../services/paymentService");

const router = express.Router();

router.use(authenticate);

// ── Initiate payment ─────────────────────────────────────────────────
router.post(
  "/initiate",
  authorize("project_proponent"),
  validate([
    body("application_id").isUUID().withMessage("Valid application ID required"),
    body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be positive"),
    body("payment_method")
      .optional()
      .isIn(["upi", "qr_code", "net_banking", "mock"]),
  ]),
  async (req, res, next) => {
    try {
      const result = await PaymentService.initiate(
        req.body.application_id,
        req.user.id,
        req.body
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// ── Confirm payment (mock webhook) ───────────────────────────────────
router.post(
  "/:id/confirm",
  validate([param("id").isUUID()]),
  async (req, res, next) => {
    try {
      const payment = await PaymentService.confirm(req.params.id);
      res.json(payment);
    } catch (err) {
      next(err);
    }
  }
);

// ── List payments for an application ─────────────────────────────────
router.get(
  "/application/:applicationId",
  validate([param("applicationId").isUUID()]),
  async (req, res, next) => {
    try {
      const payments = await PaymentService.listByApplication(req.params.applicationId);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  }
);

// ── Admin: List all payments ─────────────────────────────────────────
router.get(
  "/",
  authorize("admin"),
  validate([
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["pending", "completed", "failed", "refunded"]),
  ]),
  async (req, res, next) => {
    try {
      const result = await PaymentService.listAll({
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
        status: req.query.status,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
