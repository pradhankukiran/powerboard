import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateMetabaseEmbedUrl(
  resourceType: "dashboard" | "question",
  resourceId: number,
  params: Record<string, unknown> = {},
): string {
  const payload = {
    resource: { [resourceType]: resourceId },
    params,
    exp: Math.round(Date.now() / 1000) + 600,
  };

  const token = jwt.sign(payload, env.metabaseEmbeddingSecret);

  return `${env.metabaseUrl}/embed/${resourceType}/${token}#bordered=false&titled=true`;
}
