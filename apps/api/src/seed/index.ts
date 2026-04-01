import { sequelize } from "../config/database.js";
import { initModels } from "../models/index.js";
import { seedUsers } from "./users.seed.js";
import { seedClients } from "./clients.seed.js";
import { seedTechnicians } from "./technicians.seed.js";
import { seedDevices } from "./devices.seed.js";
import { seedTickets } from "./tickets.seed.js";
import { seedAlerts } from "./alerts.seed.js";
import { seedPrintJobs } from "./printJobs.seed.js";
import { seedSLAMetrics } from "./slaMetrics.seed.js";

export async function seed() {
  console.log("Seeding database...\n");
  const start = Date.now();

  // 1. No-dependency tables
  console.log("[1/8] Users");
  const users = await seedUsers();

  console.log("[2/8] Clients");
  const clients = await seedClients();

  // 2. Depends on Users
  console.log("[3/8] Technicians");
  await seedTechnicians(users);

  // 3. Depends on Clients
  console.log("[4/8] Devices");
  const devices = await seedDevices(clients);

  // 4. Depends on Clients, Users, Devices
  console.log("[5/8] Tickets");
  await seedTickets(clients, users, devices);

  // 5. Depends on Devices, Clients, Users (also creates some Tickets)
  console.log("[6/8] Alerts");
  await seedAlerts(devices, clients, users);

  // 6. Depends on Devices, Clients, Users
  console.log("[7/8] Print Jobs");
  await seedPrintJobs(devices, clients, users);

  // 7. Depends on Clients
  console.log("[8/8] SLA Metrics");
  await seedSLAMetrics(clients);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nSeeding complete in ${elapsed}s`);
}

// Run directly via: npx tsx src/seed/index.ts
const isMain =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("seed/index.ts");

if (isMain) {
  (async () => {
    try {
      console.log("Connecting to database...");
      await sequelize.authenticate();
      console.log("Connected.\n");

      initModels();

      console.log("Syncing schema (force: true)...");
      await sequelize.sync({ force: true });
      console.log("Schema synced.\n");

      await seed();

      await sequelize.close();
      console.log("Database connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Seed failed:", err);
      await sequelize.close().catch(() => {});
      process.exit(1);
    }
  })();
}
