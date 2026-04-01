import { Router, Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import { Alert } from "../models/Alert.js";
import { Device } from "../models/Device.js";
import { Client } from "../models/Client.js";
import { AuthRequest } from "../middleware/auth.js";

export const alertRoutes = Router();

// GET / — list with pagination + filters
alertRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.severity) where.severity = req.query.severity;
    if (req.query.clientId) where.clientId = req.query.clientId;
    if (req.query.isAcknowledged !== undefined) {
      where.isAcknowledged = req.query.isAcknowledged === "true";
    }

    const { rows, count } = await Alert.findAndCountAll({
      where,
      include: [
        { model: Device, as: "device", attributes: ["hostname"] },
        { model: Client, as: "client", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({ data: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch alerts", error: String(err) });
  }
});

// GET /stats — aggregate counts
alertRoutes.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [bySeverity, byType, unacknowledged, total] = await Promise.all([
      Alert.findAll({
        attributes: ["severity", [fn("COUNT", col("id")), "count"]],
        group: ["severity"],
        raw: true,
      }),
      Alert.findAll({
        attributes: ["type", [fn("COUNT", col("id")), "count"]],
        group: ["type"],
        raw: true,
      }),
      Alert.count({ where: { isAcknowledged: false } }),
      Alert.count(),
    ]);

    res.json({ data: { bySeverity, byType, unacknowledged, total } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch alert stats", error: String(err) });
  }
});

// PATCH /:id/acknowledge — mark alert as acknowledged
alertRoutes.patch("/:id/acknowledge", async (req: Request, res: Response) => {
  try {
    const alert = await Alert.findByPk(req.params.id as string);
    if (!alert) {
      res.status(404).json({ message: "Alert not found" });
      return;
    }

    const authReq = req as AuthRequest;
    await alert.update({
      isAcknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedById: authReq.userId || null,
    });

    res.json({ data: alert });
  } catch (err) {
    res.status(500).json({ message: "Failed to acknowledge alert", error: String(err) });
  }
});
