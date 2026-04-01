import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  logging: env.nodeEnv === "development" ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 10,
    min: 2,
    idle: 30000,
    acquire: 30000,
  },
});
