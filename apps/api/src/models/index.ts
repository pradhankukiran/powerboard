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
  Client.hasMany(Device, { foreignKey: "clientId", as: "devices" });
  Client.hasMany(Ticket, { foreignKey: "clientId", as: "tickets" });
  Client.hasMany(Alert, { foreignKey: "clientId", as: "alerts" });
  Client.hasMany(PrintJob, { foreignKey: "clientId", as: "printJobs" });
  Client.hasMany(SLAMetric, { foreignKey: "clientId", as: "slaMetrics" });

  // --- Device associations ---
  Device.belongsTo(Client, { foreignKey: "clientId", as: "client" });
  Device.hasMany(Ticket, { foreignKey: "deviceId", as: "tickets" });
  Device.hasMany(Alert, { foreignKey: "deviceId", as: "alerts" });
  Device.hasMany(PrintJob, { foreignKey: "deviceId", as: "printJobs" });

  // --- User associations ---
  User.hasMany(Ticket, { foreignKey: "assignedToId", as: "assignedTickets" });
  User.hasMany(Alert, {
    foreignKey: "acknowledgedById",
    as: "acknowledgedAlerts",
  });
  User.hasMany(PrintJob, { foreignKey: "userId", as: "printJobs" });
  User.hasOne(Technician, { foreignKey: "userId", as: "technician" });

  // --- Ticket associations ---
  Ticket.belongsTo(Client, { foreignKey: "clientId", as: "client" });
  Ticket.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
  Ticket.belongsTo(Device, { foreignKey: "deviceId", as: "device" });

  // --- Alert associations ---
  Alert.belongsTo(Device, { foreignKey: "deviceId", as: "device" });
  Alert.belongsTo(Client, { foreignKey: "clientId", as: "client" });
  Alert.belongsTo(User, {
    foreignKey: "acknowledgedById",
    as: "acknowledgedBy",
  });

  // --- PrintJob associations ---
  PrintJob.belongsTo(Device, { foreignKey: "deviceId", as: "device" });
  PrintJob.belongsTo(Client, { foreignKey: "clientId", as: "client" });
  PrintJob.belongsTo(User, { foreignKey: "userId", as: "user" });

  // --- Technician associations ---
  Technician.belongsTo(User, { foreignKey: "userId", as: "user" });

  // --- SLAMetric associations ---
  SLAMetric.belongsTo(Client, { foreignKey: "clientId", as: "client" });
}

export { User } from "./User.js";
export { Client } from "./Client.js";
export { Device } from "./Device.js";
export { Ticket } from "./Ticket.js";
export { Alert } from "./Alert.js";
export { Technician } from "./Technician.js";
export { PrintJob } from "./PrintJob.js";
export { SLAMetric } from "./SLAMetric.js";
