import { Router, Request, Response } from "express";
import { fn, col } from "sequelize";
import { PrintJob } from "../models/PrintJob.js";
import { Device } from "../models/Device.js";
import { Client } from "../models/Client.js";

export const printJobRoutes = Router();

// GET / — list with pagination + filters
printJobRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.clientId) where.clientId = req.query.clientId;
    if (req.query.status) where.status = req.query.status;

    const { rows, count } = await PrintJob.findAndCountAll({
      where,
      include: [
        { model: Device, as: "device", attributes: ["hostname"] },
        { model: Client, as: "client", attributes: ["name"] },
      ],
      order: [["submittedAt", "DESC"]],
      limit,
      offset,
    });

    res.json({ data: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch print jobs", error: String(err) });
  }
});

// GET /stats — aggregate totals
printJobRoutes.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totals, byStatus] = await Promise.all([
      PrintJob.findOne({
        attributes: [
          [fn("COUNT", col("id")), "totalJobs"],
          [fn("SUM", col("pages")), "totalPages"],
          [fn("SUM", col("color_pages")), "totalColorPages"],
          [fn("SUM", col("cost_estimate")), "totalCost"],
        ],
        raw: true,
      }),
      PrintJob.findAll({
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      }),
    ]);

    const stats = totals as unknown as Record<string, unknown>;
    res.json({
      data: {
        totalJobs: stats?.totalJobs ?? 0,
        totalPages: stats?.totalPages ?? 0,
        totalColorPages: stats?.totalColorPages ?? 0,
        totalCost: stats?.totalCost ?? 0,
        byStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch print job stats", error: String(err) });
  }
});
