// ── MoM Service ──────────────────────────────────────────────────────
// Meeting creation, agenda, MoM generation, finalize & publish

const {
  Meeting,
  MeetingApplication,
  Application,
  StatusHistory,
  User,
  ApplicationCategory,
  Sector,
} = require("../models");

class MomService {
  // ── Create a new meeting ─────────────────────────────
  static async createMeeting(userId, { title, meeting_date, venue, agenda }) {
    const meeting = await Meeting.create({
      title,
      meeting_date,
      venue: venue || null,
      agenda: agenda || null,
      created_by: userId,
      status: "draft",
    });

    return MomService.findMeetingById(meeting.id);
  }

  // ── Add applications to meeting agenda ───────────────
  static async addApplicationsToMeeting(meetingId, applicationIds, userId) {
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      const err = new Error("Meeting not found");
      err.status = 404;
      throw err;
    }

    const results = [];
    for (let i = 0; i < applicationIds.length; i++) {
      const app = await Application.findByPk(applicationIds[i]);
      if (!app) continue;

      const [ma, created] = await MeetingApplication.findOrCreate({
        where: { meeting_id: meetingId, application_id: applicationIds[i] },
        defaults: { agenda_item_number: i + 1 },
      });

      if (app.status === "approved_for_meeting") {
        const prev = app.status;
        app.status = "mom_preparation";
        await app.save();

        await StatusHistory.create({
          application_id: app.id,
          changed_by: userId,
          from_status: prev,
          to_status: "mom_preparation",
          remarks: `Added to meeting: ${meeting.title}`,
        });
      }

      results.push(ma);
    }

    return results;
  }

  // ── Update meeting minutes ───────────────────────────
  static async updateMinutes(meetingId, { agenda, minutes }) {
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      const err = new Error("Meeting not found");
      err.status = 404;
      throw err;
    }

    if (agenda !== undefined) meeting.agenda = agenda;
    if (minutes !== undefined) meeting.minutes = minutes;
    await meeting.save();

    return MomService.findMeetingById(meeting.id);
  }

  // ── Record decision for an application in a meeting ──
  static async recordDecision(meetingId, applicationId, decision) {
    const ma = await MeetingApplication.findOne({
      where: { meeting_id: meetingId, application_id: applicationId },
    });

    if (!ma) {
      const err = new Error("Application not found in this meeting");
      err.status = 404;
      throw err;
    }

    ma.decision = decision;
    await ma.save();
    return ma;
  }

  // ── Finalize meeting ─────────────────────────────────
  static async finalize(meetingId) {
    const meeting = await Meeting.findByPk(meetingId);
    if (!meeting) {
      const err = new Error("Meeting not found");
      err.status = 404;
      throw err;
    }

    meeting.status = "finalized";
    await meeting.save();
    return MomService.findMeetingById(meeting.id);
  }

  // ── Publish meeting (and update application statuses) ─
  static async publish(meetingId, userId) {
    const meeting = await Meeting.findByPk(meetingId, {
      include: [{ model: MeetingApplication, as: "meetingApplications" }],
    });

    if (!meeting) {
      const err = new Error("Meeting not found");
      err.status = 404;
      throw err;
    }

    meeting.status = "published";
    meeting.published_at = new Date();
    await meeting.save();

    // Transition all meeting applications to final_publication
    for (const ma of meeting.meetingApplications) {
      const app = await Application.findByPk(ma.application_id);
      if (app && app.status === "mom_preparation") {
        const prev = app.status;
        app.status = "final_publication";
        app.published_at = new Date();
        await app.save();

        await StatusHistory.create({
          application_id: app.id,
          changed_by: userId,
          from_status: prev,
          to_status: "final_publication",
          remarks: "MoM published",
        });
      }
    }

    return MomService.findMeetingById(meeting.id);
  }

  // ── List meetings ────────────────────────────────────
  static async listMeetings({ page = 1, limit = 20, status }) {
    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await Meeting.findAndCountAll({
      where,
      include: [
        { model: User, as: "creator", attributes: ["id", "name"] },
      ],
      order: [["meeting_date", "DESC"]],
      limit,
      offset,
    });

    return { meetings: rows, total: count, page, totalPages: Math.ceil(count / limit) };
  }

  // ── Find meeting by ID with full data ────────────────
  static async findMeetingById(meetingId) {
    const meeting = await Meeting.findByPk(meetingId, {
      include: [
        { model: User, as: "creator", attributes: ["id", "name"] },
        {
          model: MeetingApplication,
          as: "meetingApplications",
          include: [
            {
              model: Application,
              as: "application",
              include: [
                { model: User, as: "applicant", attributes: ["id", "name", "organization"] },
                { model: ApplicationCategory, as: "category", attributes: ["id", "code", "name"] },
                { model: Sector, as: "sector", attributes: ["id", "name"] },
              ],
            },
          ],
        },
      ],
    });

    if (!meeting) {
      const err = new Error("Meeting not found");
      err.status = 404;
      throw err;
    }

    return meeting;
  }
}

module.exports = MomService;
