import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { Client } from "./Client.js";
import { Device } from "./Device.js";
import { Ticket } from "./Ticket.js";
import { Alert } from "./Alert.js";
import { Technician } from "./Technician.js";
import { PrintJob } from "./PrintJob.js";
import { SLAMetric } from "./SLAMetric.js";

export function initModels(): void {
  // Initialize all models
  User.initModel(sequelize);
  Client.initModel(sequelize);
  Device.initModel(sequelize);
  Ticket.initModel(sequelize);
  Alert.initModel(sequelize);
  Technician.initModel(sequelize);
  PrintJob.initModel(sequelize);
  SLAMetric.initModel(sequelize);

  // --- Client associations ---
  Client.hasMany(Device, { foreignKey: "clientId", as: "devices", onDelete: "CASCADE" });
  Client.hasMany(Ticket, { foreignKey: "clientId", as: "tickets", onDelete: "CASCADE" });
  Client.hasMany(Alert, { foreignKey: "clientId", as: "alerts", onDelete: "CASCADE" });
  Client.hasMany(PrintJob, { foreignKey: "clientId", as: "printJobs", onDelete: "CASCADE" });
  Client.hasMany(SLAMetric, { foreignKey: "clientId", as: "slaMetrics", onDelete: "CASCADE" });

  // --- Device associations ---
  Device.belongsTo(Client, { foreignKey: "clientId", as: "client", onDelete: "CASCADE" });
  Device.hasMany(Ticket, { foreignKey: "deviceId", as: "tickets", onDelete: "SET NULL" });
  Device.hasMany(Alert, { foreignKey: "deviceId", as: "alerts", onDelete: "CASCADE" });
  Device.hasMany(PrintJob, { foreignKey: "deviceId", as: "printJobs", onDelete: "SET NULL" });

  // --- User associations ---
  User.hasMany(Ticket, { foreignKey: "assignedToId", as: "assignedTickets", onDelete: "SET NULL" });
  User.hasMany(Alert, {
    foreignKey: "acknowledgedById",
    as: "acknowledgedAlerts",
    onDelete: "SET NULL",
  });
  User.hasMany(PrintJob, { foreignKey: "userId", as: "printJobs", onDelete: "SET NULL" });
  User.hasOne(Technician, { foreignKey: "userId", as: "technician", onDelete: "CASCADE" });

  // --- Ticket associations ---
  Ticket.belongsTo(Client, { foreignKey: "clientId", as: "client", onDelete: "CASCADE" });
  Ticket.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo", onDelete: "SET NULL" });
  Ticket.belongsTo(Device, { foreignKey: "deviceId", as: "device", onDelete: "SET NULL" });

  // --- Alert associations ---
  Alert.belongsTo(Device, { foreignKey: "deviceId", as: "device", onDelete: "CASCADE" });
  Alert.belongsTo(Client, { foreignKey: "clientId", as: "client", onDelete: "CASCADE" });
  Alert.belongsTo(User, {
    foreignKey: "acknowledgedById",
    as: "acknowledgedBy",
    onDelete: "SET NULL",
  });

  // --- PrintJob associations ---
  PrintJob.belongsTo(Device, { foreignKey: "deviceId", as: "device", onDelete: "SET NULL" });
  PrintJob.belongsTo(Client, { foreignKey: "clientId", as: "client", onDelete: "CASCADE" });
  PrintJob.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "SET NULL" });

  // --- Technician associations ---
  Technician.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });

  // --- SLAMetric associations ---
  SLAMetric.belongsTo(Client, { foreignKey: "clientId", as: "client", onDelete: "CASCADE" });
}

export { User } from "./User.js";
export { Client } from "./Client.js";
export { Device } from "./Device.js";
export { Ticket } from "./Ticket.js";
export { Alert } from "./Alert.js";
export { Technician } from "./Technician.js";
export { PrintJob } from "./PrintJob.js";
export { SLAMetric } from "./SLAMetric.js";
