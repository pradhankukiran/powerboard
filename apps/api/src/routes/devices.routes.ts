import { Router, Request, Response } from "express";
import { fn, col } from "sequelize";
import { Device } from "../models/Device.js";
import { Client } from "../models/Client.js";

export const deviceRoutes = Router();

// GET / — list with pagination + filters
deviceRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.clientId) where.clientId = req.query.clientId;
    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;

    const { rows, count } = await Device.findAndCountAll({
      where,
      include: [{ model: Client, as: "client", attributes: ["name"] }],
      order: [["hostname", "ASC"]],
      limit,
      offset,
    });

    res.json({ data: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch devices", error: String(err) });
  }
});

// GET /stats — counts by type and status
deviceRoutes.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [byType, byStatus, total] = await Promise.all([
      Device.findAll({
        attributes: ["type", [fn("COUNT", col("id")), "count"]],
        group: ["type"],
        raw: true,
      }),
      Device.findAll({
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      }),
      Device.count(),
    ]);

    res.json({ data: { byType, byStatus, total } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch device stats", error: String(err) });
  }
});

// GET /:id — single device with client
deviceRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const device = await Device.findByPk(req.params.id as string, {
      include: [{ model: Client, as: "client" }],
    });

    if (!device) {
      res.status(404).json({ message: "Device not found" });
      return;
    }

    res.json({ data: device });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch device", error: String(err) });
  }
});
