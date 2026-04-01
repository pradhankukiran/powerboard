import { Router, Request, Response } from "express";
import { Technician } from "../models/Technician.js";
import { User } from "../models/User.js";

export const technicianRoutes = Router();

// GET / — list all technicians with user info
technicianRoutes.get("/", async (_req: Request, res: Response) => {
  try {
    const technicians = await Technician.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "email"],
        },
      ],
      order: [["satisfactionScore", "DESC"]],
    });

    res.json({ data: technicians });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch technicians", error: String(err) });
  }
});

// GET /:id — single technician with user info
technicianRoutes.get("/:id", async (req: Request, res: Response) => {
  try {
    const technician = await Technician.findByPk(req.params.id as string, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "role"],
        },
      ],
    });

    if (!technician) {
      res.status(404).json({ message: "Technician not found" });
      return;
    }

    res.json({ data: technician });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch technician", error: String(err) });
  }
});
