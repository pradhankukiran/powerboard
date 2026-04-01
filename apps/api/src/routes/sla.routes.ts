import { Router, Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import { SLAMetric } from "../models/SLAMetric.js";
import { Client } from "../models/Client.js";

export const slaRoutes = Router();

// GET / — list with pagination + filters
slaRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.clientId) where.clientId = req.query.clientId;
    if (req.query.startDate || req.query.endDate) {
      const dateFilter: Record<symbol, string> = {};
      if (req.query.startDate) dateFilter[Op.gte] = req.query.startDate as string;
      if (req.query.endDate) dateFilter[Op.lte] = req.query.endDate as string;
      where.date = dateFilter;
    }

    const { rows, count } = await SLAMetric.findAndCountAll({
      where,
      include: [{ model: Client, as: "client", attributes: ["name"] }],
      order: [["date", "DESC"]],
      limit,
      offset,
    });

    res.json({ data: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch SLA metrics", error: String(err) });
  }
});

// GET /summary — aggregated summary across all clients
slaRoutes.get("/summary", async (_req: Request, res: Response) => {
  try {
    const summary = await SLAMetric.findOne({
      attributes: [
        [fn("AVG", col("uptime_percent")), "avgUptime"],
        [fn("AVG", col("avg_response_minutes")), "avgResponseTime"],
        [fn("SUM", col("breach_count")), "totalBreaches"],
        [fn("AVG", col("avg_resolution_minutes")), "avgResolutionTime"],
      ],
      raw: true,
    });

    const stats = summary as unknown as Record<string, unknown>;
    res.json({
      data: {
        avgUptime: stats?.avgUptime ?? null,
        avgResponseTime: stats?.avgResponseTime ?? null,
        totalBreaches: stats?.totalBreaches ?? 0,
        avgResolutionTime: stats?.avgResolutionTime ?? null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch SLA summary", error: String(err) });
  }
});
