// ── Dashboard Service ────────────────────────────────────────────────
// Aggregated statistics for the admin dashboard and reports

const { Application, ApplicationCategory, Sector, Payment, User, Role, sequelize } = require("../models");
const { fn, col, literal } = require("sequelize");

class DashboardService {
  // ── Overview stats ───────────────────────────────────
  static async getOverview() {
    const [
      totalApplications,
      statusCounts,
      totalUsers,
      totalPayments,
      revenueResult,
    ] = await Promise.all([
      Application.count(),
      Application.findAll({
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      }),
      User.count(),
      Payment.count({ where: { status: "completed" } }),
      Payment.findOne({
        attributes: [[fn("SUM", col("amount")), "total_revenue"]],
        where: { status: "completed" },
        raw: true,
      }),
    ]);

    // Convert statusCounts array into an object
    const byStatus = {};
    for (const row of statusCounts) {
      byStatus[row.status] = parseInt(row.count, 10);
    }

    return {
      total_applications: totalApplications,
      by_status: byStatus,
      total_users: totalUsers,
      completed_payments: totalPayments,
      total_revenue: parseFloat(revenueResult?.total_revenue || 0),
    };
  }

  // ── Applications by category ─────────────────────────
  static async byCategory() {
    const results = await Application.findAll({
      attributes: ["category_id", [fn("COUNT", col("Application.id")), "count"]],
      include: [{ model: ApplicationCategory, as: "category", attributes: ["code", "name"] }],
      group: ["category_id", "category.id"],
      raw: true,
      nest: true,
    });
    return results;
  }

  // ── Applications by sector ───────────────────────────
  static async bySector() {
    const results = await Application.findAll({
      attributes: ["sector_id", [fn("COUNT", col("Application.id")), "count"]],
      include: [{ model: Sector, as: "sector", attributes: ["name"] }],
      group: ["sector_id", "sector.id"],
      raw: true,
      nest: true,
    });
    return results;
  }

  // ── Monthly application trend (last 12 months) ──────
  static async monthlyTrend() {
    const results = await Application.findAll({
      attributes: [
        [fn("DATE_TRUNC", "month", col("created_at")), "month"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: {
        created_at: {
          [require("sequelize").Op.gte]: new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          ),
        },
      },
      group: [fn("DATE_TRUNC", "month", col("created_at"))],
      order: [[fn("DATE_TRUNC", "month", col("created_at")), "ASC"]],
      raw: true,
    });
    return results;
  }
}

module.exports = DashboardService;
