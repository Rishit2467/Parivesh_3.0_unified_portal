// ── Payment Service ──────────────────────────────────────────────────
// Mock UPI/QR payment processing for EC application fees

const { v4: uuidv4 } = require("uuid");
const { Payment, Application } = require("../models");

class PaymentService {
  // ── Initiate a mock payment ──────────────────────────
  static async initiate(applicationId, userId, { amount, payment_method }) {
    const app = await Application.findByPk(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404;
      throw err;
    }

    const payment = await Payment.create({
      application_id: applicationId,
      user_id: userId,
      amount,
      payment_method: payment_method || "mock",
      status: "pending",
    });

    // Return mock UPI payment data
    return {
      payment_id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      payment_method: payment.payment_method,
      status: payment.status,
      // Mock UPI links
      upi_link: `upi://pay?pa=parivesh@gov&pn=PARIVESH&am=${amount}&tn=EC-Fee-${app.reference_number}`,
      qr_data: `upi://pay?pa=parivesh@gov&pn=PARIVESH&am=${amount}&tn=EC-Fee-${app.reference_number}`,
    };
  }

  // ── Confirm / complete payment (mock webhook) ────────
  static async confirm(paymentId) {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      const err = new Error("Payment not found");
      err.status = 404;
      throw err;
    }

    if (payment.status !== "pending") {
      const err = new Error("Payment is not in pending state");
      err.status = 400;
      throw err;
    }

    payment.status = "completed";
    payment.transaction_id = `TXN-${uuidv4().substring(0, 12).toUpperCase()}`;
    payment.paid_at = new Date();
    await payment.save();

    return payment;
  }

  // ── List payments for an application ─────────────────
  static async listByApplication(applicationId) {
    return Payment.findAll({
      where: { application_id: applicationId },
      order: [["created_at", "DESC"]],
    });
  }

  // ── List all payments (admin view) ───────────────────
  static async listAll({ page = 1, limit = 20, status }) {
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Application,
          as: "application",
          attributes: ["id", "reference_number", "project_name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return { payments: rows, total: count, page, totalPages: Math.ceil(count / limit) };
  }
}

module.exports = PaymentService;
