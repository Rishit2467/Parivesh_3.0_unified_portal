// ── Scrutiny Service ─────────────────────────────────────────────────
// Review, remarks, queries, approve/reject for scrutiny team

const {
  Application,
  Remark,
  StatusHistory,
  User,
  ApplicationCategory,
  Sector,
  Document,
} = require("../models");

class ScrutinyService {
  // ── List applications assigned to a scrutiny officer ──
  static async listAssigned(scrutinyUserId, { page = 1, limit = 20, status }) {
    const where = { assigned_scrutiny_id: scrutinyUserId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await Application.findAndCountAll({
      where,
      include: [
        { model: User, as: "applicant", attributes: ["id", "name", "email", "organization"] },
        { model: ApplicationCategory, as: "category", attributes: ["id", "code", "name"] },
        { model: Sector, as: "sector", attributes: ["id", "name"] },
      ],
      order: [["updated_at", "DESC"]],
      limit,
      offset,
    });

    return { applications: rows, total: count, page, totalPages: Math.ceil(count / limit) };
  }

  // ── Add a remark/query to an application ─────────────
  static async addRemark(applicationId, userId, { remark_type, content }) {
    const app = await Application.findByPk(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404;
      throw err;
    }

    const remark = await Remark.create({
      application_id: applicationId,
      user_id: userId,
      remark_type,
      content,
    });

    // If raising a query, transition status to query_raised
    if (remark_type === "query" && app.status === "under_scrutiny") {
      const prev = app.status;
      app.status = "query_raised";
      await app.save();

      await StatusHistory.create({
        application_id: applicationId,
        changed_by: userId,
        from_status: prev,
        to_status: "query_raised",
        remarks: `Query raised: ${content.substring(0, 100)}`,
      });
    }

    return remark;
  }

  // ── List remarks for an application ──────────────────
  static async listRemarks(applicationId) {
    return Remark.findAll({
      where: { application_id: applicationId },
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
      order: [["created_at", "ASC"]],
    });
  }

  // ── Resolve a query ──────────────────────────────────
  static async resolveQuery(remarkId, userId) {
    const remark = await Remark.findByPk(remarkId);
    if (!remark) {
      const err = new Error("Remark not found");
      err.status = 404;
      throw err;
    }

    remark.is_resolved = true;
    remark.resolved_at = new Date();
    await remark.save();
    return remark;
  }

  // ── Approve application (move to approved_for_meeting) ─
  static async approve(applicationId, userId, remarks) {
    const app = await Application.findByPk(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404;
      throw err;
    }

    if (app.status !== "under_scrutiny") {
      const err = new Error("Application must be under scrutiny to approve");
      err.status = 400;
      throw err;
    }

    const prev = app.status;
    app.status = "approved_for_meeting";
    app.approved_at = new Date();
    await app.save();

    // Record approval remark
    await Remark.create({
      application_id: applicationId,
      user_id: userId,
      remark_type: "approval",
      content: remarks || "Application approved for meeting",
    });

    await StatusHistory.create({
      application_id: applicationId,
      changed_by: userId,
      from_status: prev,
      to_status: "approved_for_meeting",
      remarks: remarks || "Application approved by scrutiny team",
    });

    return app;
  }

  // ── Send back for correction ─────────────────────────
  static async sendBack(applicationId, userId, remarks) {
    const app = await Application.findByPk(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404;
      throw err;
    }

    const prev = app.status;
    app.status = "query_raised";
    await app.save();

    await Remark.create({
      application_id: applicationId,
      user_id: userId,
      remark_type: "correction",
      content: remarks,
    });

    await StatusHistory.create({
      application_id: applicationId,
      changed_by: userId,
      from_status: prev,
      to_status: "query_raised",
      remarks: `Sent back for correction: ${remarks.substring(0, 100)}`,
    });

    return app;
  }
}

module.exports = ScrutinyService;
