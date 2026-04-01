import { Router } from "express";
import { env } from "../config/env.js";
import { generateMetabaseEmbedUrl } from "../services/metabase.service.js";
import { getSupersetGuestToken } from "../services/superset.service.js";

export const embedRoutes = Router();

embedRoutes.get("/grafana-url", async (_req, res) => {
  res.json({ url: env.grafanaPublicUrl });
});

embedRoutes.post("/metabase-token", async (req, res) => {
  try {
    const { resourceType, resourceId, params } = req.body;
    const url = generateMetabaseEmbedUrl(resourceType, resourceId, params);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate Metabase embed URL" });
  }
});

embedRoutes.post("/superset-token", async (req, res) => {
  try {
    const { dashboardId } = req.body;
    const token = await getSupersetGuestToken(dashboardId);
    res.json({ token });
  } catch (err) {
    console.error("Superset token error:", err);
    res.status(500).json({ message: "Failed to get Superset guest token", error: String(err) });
  }
});
