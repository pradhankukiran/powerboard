export const env = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://powerboard:powerboard_dev@localhost:5432/powerboard",
  jwtSecret: process.env.JWT_SECRET || "dev-jwt-secret-change-me",
  grafanaUrl: process.env.GRAFANA_URL || "http://localhost:3002",
  grafanaPublicUrl: process.env.GRAFANA_PUBLIC_URL || process.env.GRAFANA_URL || "http://localhost:3002",
  supersetPublicUrl: process.env.SUPERSET_PUBLIC_URL || process.env.SUPERSET_URL || "http://localhost:8088",
  metabaseUrl: process.env.METABASE_URL || "http://localhost:3003",
  metabaseEmbeddingSecret:
    process.env.METABASE_EMBEDDING_SECRET ||
    "my-metabase-embedding-secret-key-min-16-chars",
  supersetUrl: process.env.SUPERSET_URL || "http://localhost:8088",
  supersetAdminUser: process.env.SUPERSET_ADMIN_USER || "admin",
  supersetAdminPassword: process.env.SUPERSET_ADMIN_PASSWORD || "admin",
};
