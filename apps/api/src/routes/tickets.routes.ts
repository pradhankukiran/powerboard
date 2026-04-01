import { Router, Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import { sequelize } from "../config/database.js";
import { Ticket } from "../models/Ticket.js";
import { Client } from "../models/Client.js";
import { User } from "../models/User.js";
import { Device } from "../models/Device.js";

export const ticketRoutes = Router();

// GET / — list with pagination + filters
ticketRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.clientId) where.clientId = req.query.clientId;

    const { rows, count } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: Client, as: "client", attributes: ["name"] },
        {
          model: User,
          as: "assignedTo",
          attributes: ["firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({ data: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets", error: String(err) });
  }
});

// GET /stats — aggregate counts
ticketRoutes.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [byStatus, byPriority, avgResolution, total] = await Promise.all([
      Ticket.findAll({
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      }),
      Ticket.findAll({
        attributes: ["priority", [fn("COUNT", col("id")), "count"]],
        group: ["priority"],
        raw: true,
      }),
      Ticket.findOne({
        attributes: [[fn("AVG", col("resolution_time_minutes")), "avgResolutionTime"]],
        where: { resolutionTimeMinutes: { [Op.ne]: null } },
        raw: true,
      }),
      Ticket.count(),
    ]);

    res.json({
      data: {
        byStatus,
        byPriority,
        avgResolutionTime: (avgResolution as unknown as Record<string, unknown>)?.avgResolutionTime ?? null,
        total,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ticket stats", error: String(err) });
  }
});

// GET /:id — single ticket with full includes
ticketRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id as string, {
      include: [
        { model: Client, as: "client" },
        { model: User, as: "assignedTo", attributes: ["id", "firstName", "lastName", "email"] },
        { model: Device, as: "device" },
      ],
    });

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    res.json({ data: ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ticket", error: String(err) });
  }
});

// POST / — create ticket with auto-generated ticketNumber
ticketRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const { subject, description, priority, category, clientId, deviceId, assignedToId } = req.body;

    const ticket = await sequelize.transaction(async (t) => {
      const [result] = await sequelize.query<{ next_num: number }>(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1 AS next_num FROM tickets`,
        { transaction: t, type: "SELECT" as never },
      );
      const nextNum = (result as unknown as { next_num: number }).next_num;
      const ticketNumber = `TKT-${String(nextNum).padStart(5, "0")}`;

      return Ticket.create(
        {
          ticketNumber,
          subject,
          description,
          priority,
          category,
          clientId,
          deviceId: deviceId || null,
          assignedToId: assignedToId || null,
        },
        { transaction: t },
      );
    });

    res.status(201).json({ data: ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to create ticket", error: String(err) });
  }
});

// PATCH /:id — update ticket fields
ticketRoutes.patch("/:id", async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id as string);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.assignedToId !== undefined) updates.assignedToId = req.body.assignedToId;
    if (req.body.priority !== undefined) updates.priority = req.body.priority;

    // Auto-set timestamp and duration fields on status transitions
    if (req.body.status === "resolved" && ticket.status !== "resolved") {
      const now = new Date();
      updates.resolvedAt = now;
      updates.resolutionTimeMinutes = Math.round(
        (now.getTime() - ticket.createdAt.getTime()) / 60000,
      );
      if (!ticket.responseTimeMinutes) {
        updates.responseTimeMinutes = updates.resolutionTimeMinutes;
      }
    }
    if (req.body.status === "closed") {
      updates.closedAt = new Date();
    }

    await ticket.update(updates);

    res.json({ data: ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to update ticket", error: String(err) });
  }
});
