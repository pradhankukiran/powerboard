import { env } from "../config/env.js";

export function getGrafanaUrl(): string {
  return env.grafanaUrl;
}
