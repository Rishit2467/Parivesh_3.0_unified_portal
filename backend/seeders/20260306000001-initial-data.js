"use strict";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// ── Seed Data ────────────────────────────────────────────────────────
// Populates roles, categories, sectors, and a default admin user

module.exports = {
  async up(queryInterface) {
    // ── Roles ────────────────────────────────────────────
    await queryInterface.bulkInsert("roles", [
      { id: 1, name: "admin",              description: "System administrator",                  created_at: new Date(), updated_at: new Date() },
      { id: 2, name: "project_proponent",  description: "Project Proponent / RQP",               created_at: new Date(), updated_at: new Date() },
      { id: 3, name: "scrutiny_team",      description: "Scrutiny and review team member",        created_at: new Date(), updated_at: new Date() },
      { id: 4, name: "mom_team",           description: "Minutes of Meeting preparation team",    created_at: new Date(), updated_at: new Date() },
    ]);

    // ── Default Admin User ───────────────────────────────
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash("Admin@123", salt);

    await queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        name: "System Admin",
        email: "admin@parivesh.gov.in",
        password_hash: hash,
        phone: "9999999999",
        organization: "MoEFCC",
        role_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ── Application Categories ───────────────────────────
    await queryInterface.bulkInsert("application_categories", [
      { id: 1, code: "A",  name: "Category A",  description: "Projects appraised at Central level by EAC",      is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2, code: "B1", name: "Category B1", description: "Projects appraised at State level requiring EIA", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3, code: "B2", name: "Category B2", description: "Projects appraised at State level without EIA",   is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // ── Industry Sectors ─────────────────────────────────
    await queryInterface.bulkInsert("sectors", [
      { id: 1,  name: "Mining",                         description: "Mining and mineral extraction projects",        is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 2,  name: "Infrastructure",                 description: "Roads, bridges, airports, ports",               is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 3,  name: "Energy",                         description: "Thermal, solar, wind, and hydro power",         is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 4,  name: "Industrial Projects",            description: "Manufacturing and industrial complexes",        is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 5,  name: "Construction & Township",        description: "Real estate and township development",          is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 6,  name: "River Valley & Hydroelectric",   description: "Dams, irrigation, and hydroelectric projects",  is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 7,  name: "Nuclear",                        description: "Nuclear power and related facilities",          is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 8,  name: "Waste Management",               description: "Solid waste, hazardous waste, e-waste",         is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 9,  name: "Coastal Regulation Zone (CRZ)",  description: "Projects in CRZ areas",                         is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: 10, name: "Defence & Strategic",             description: "Defence and nationally strategic projects",     is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("sectors", null, {});
    await queryInterface.bulkDelete("application_categories", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("roles", null, {});
  },
};
