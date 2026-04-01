import { Router } from "express";
import { sequelize } from "../config/database.js";

export const healthRoutes = Router();

healthRoutes.get("/", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});
