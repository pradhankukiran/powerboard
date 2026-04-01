import { Router, Request, Response } from "express";
import { literal } from "sequelize";
import { Client } from "../models/Client.js";

export const clientRoutes = Router();

// GET / — list all clients
clientRoutes.get("/", async (_req: Request, res: Response) => {
  try {
    const clients = await Client.findAll({
      order: [["name", "ASC"]],
    });

    res.json({ data: clients });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch clients", error: String(err) });
  }
});

// GET /:id — single client with related counts
clientRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const client = await Client.findByPk(req.params.id as string, {
      attributes: {
        include: [
          [
            literal(`(SELECT COUNT(*) FROM devices WHERE devices.client_id = "Client".id)`),
            "deviceCount",
          ],
          [
            literal(`(SELECT COUNT(*) FROM tickets WHERE tickets.client_id = "Client".id)`),
            "ticketCount",
          ],
          [
            literal(`(SELECT COUNT(*) FROM alerts WHERE alerts.client_id = "Client".id)`),
            "alertCount",
          ],
        ],
      },
    });

    if (!client) {
      res.status(404).json({ message: "Client not found" });
      return;
    }

    res.json({ data: client });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch client", error: String(err) });
  }
});
