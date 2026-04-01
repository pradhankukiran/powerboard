import { app } from "./app.js";
import { env } from "./config/env.js";
import { sequelize } from "./config/database.js";
import { initModels } from "./models/index.js";

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    initModels();
    await sequelize.sync();
    console.log("Models synced");

    app.listen(env.port, () => {
      console.log(`API running on port ${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();
