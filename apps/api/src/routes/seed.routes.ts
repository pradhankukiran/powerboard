import { Router } from "express";
import { env } from "../config/env.js";
import { sequelize } from "../config/database.js";
import { seed } from "../seed/index.js";

export const seedRoutes = Router();

seedRoutes.post("/", async (_req, res) => {
  if (env.nodeEnv === "production" && !process.env.ALLOW_SEED) {
    res.status(403).json({ message: "Seeding is disabled in production" });
    return;
  }

  try {
    await seed();
    res.json({ message: "Database seeded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Seeding failed" });
  }
});

seedRoutes.post("/create-db", async (_req, res) => {
  try {
    await sequelize.query("DROP DATABASE IF EXISTS powerboard_superset", { raw: true });
    await sequelize.query("CREATE DATABASE powerboard_superset", { raw: true });
    res.json({ message: "Database recreated" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: String(err) });
  }
});

seedRoutes.post("/reset", async (_req, res) => {
  if (env.nodeEnv === "production" && !process.env.ALLOW_SEED) {
    res.status(403).json({ message: "Reset is disabled in production" });
    return;
  }

  try {
    await sequelize.sync({ force: true });
    await seed();
    res.json({ message: "Database reset and seeded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
});
