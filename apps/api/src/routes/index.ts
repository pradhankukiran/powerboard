import { Router } from "express";
import { healthRoutes } from "./health.routes.js";
import { authRoutes } from "./auth.routes.js";
import { ticketRoutes } from "./tickets.routes.js";
import { deviceRoutes } from "./devices.routes.js";
import { alertRoutes } from "./alerts.routes.js";
import { printJobRoutes } from "./printJobs.routes.js";
import { clientRoutes } from "./clients.routes.js";
import { technicianRoutes } from "./technicians.routes.js";
import { slaRoutes } from "./sla.routes.js";
import { embedRoutes } from "./embed.routes.js";
import { seedRoutes } from "./seed.routes.js";
import { requireAuth } from "../middleware/auth.js";

export const routes = Router();

routes.use("/health", healthRoutes);
routes.use("/auth", authRoutes);
routes.use("/seed", seedRoutes);
routes.use("/tickets", requireAuth, ticketRoutes);
routes.use("/devices", requireAuth, deviceRoutes);
routes.use("/alerts", requireAuth, alertRoutes);
routes.use("/print-jobs", requireAuth, printJobRoutes);
routes.use("/clients", requireAuth, clientRoutes);
routes.use("/technicians", requireAuth, technicianRoutes);
routes.use("/sla", requireAuth, slaRoutes);
routes.use("/embed", requireAuth, embedRoutes);
