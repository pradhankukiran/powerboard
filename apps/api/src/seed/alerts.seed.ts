import { faker } from "@faker-js/faker";
import { Client } from "../models/Client.js";
import { Device } from "../models/Device.js";
import { User } from "../models/User.js";
import { Alert, AlertCreationAttributes } from "../models/Alert.js";
import { Ticket, TicketCreationAttributes } from "../models/Ticket.js";

type AlertType =
  | "cpu_high"
  | "memory_high"
  | "disk_full"
  | "offline"
  | "service_down"
  | "security_threat"
  | "backup_failed"
  | "certificate_expiring"
  | "temperature_high";

type Severity = "critical" | "warning" | "info";

type DeviceType =
  | "workstation"
  | "server"
  | "printer"
  | "firewall"
  | "switch"
  | "access_point"
  | "ups";

const TOTAL_ALERTS = 1800;

// Alert types realistic per device type
const ALERT_TYPES_BY_DEVICE: Record<DeviceType, AlertType[]> = {
  server: [
    "cpu_high",
    "memory_high",
    "disk_full",
    "offline",
    "service_down",
    "backup_failed",
    "certificate_expiring",
    "temperature_high",
  ],
  workstation: ["cpu_high", "memory_high", "disk_full", "offline", "service_down"],
  printer: ["offline", "service_down"],
  firewall: ["cpu_high", "security_threat", "offline", "certificate_expiring"],
  switch: ["offline", "temperature_high", "cpu_high"],
  access_point: ["offline", "cpu_high"],
  ups: ["offline", "temperature_high"],
};

// Relative device-type weight for alert generation (servers generate more)
const DEVICE_ALERT_WEIGHT: Record<DeviceType, number> = {
  server: 5,
  workstation: 1,
  printer: 1,
  firewall: 3,
  switch: 2,
  access_point: 1,
  ups: 1,
};

const SEVERITY_WEIGHTS: Array<{ value: Severity; weight: number }> = [
  { value: "critical", weight: 10 },
  { value: "warning", weight: 30 },
  { value: "info", weight: 60 },
];

const MESSAGES: Record<AlertType, string[]> = {
  cpu_high: [
    "CPU utilization exceeded 95% for 5 minutes",
    "CPU usage spike detected: 98% sustained",
    "High CPU load average: 12.4 on 4-core system",
  ],
  memory_high: [
    "Memory utilization at 93% - approaching limit",
    "RAM usage critical: 15.2GB of 16GB consumed",
    "Swap usage exceeded 80% threshold",
  ],
  disk_full: [
    "Disk C: 96% full - 12GB remaining",
    "Volume /data at 98% capacity",
    "Disk space critically low: 2GB free on primary drive",
  ],
  offline: [
    "Device unreachable - no ping response for 5 minutes",
    "Agent heartbeat lost - last contact 10 minutes ago",
    "Connection timeout after 3 retry attempts",
  ],
  service_down: [
    "SQL Server service stopped unexpectedly",
    "IIS Application Pool has crashed",
    "Print spooler service not responding",
    "DHCP service failed to start",
  ],
  security_threat: [
    "Multiple failed login attempts from unknown IP",
    "Potential port scan detected from external source",
    "Intrusion detection alert: suspicious inbound traffic",
    "Malware signature detected in network traffic",
  ],
  backup_failed: [
    "Nightly backup job failed: connection timeout",
    "Incremental backup failed: insufficient disk space",
    "Backup verification failed: checksum mismatch",
  ],
  certificate_expiring: [
    "SSL certificate expires in 14 days",
    "TLS certificate for wildcard domain expiring soon",
    "Code signing certificate renewal required",
  ],
  temperature_high: [
    "System temperature exceeds 85C threshold",
    "Chassis inlet temperature warning: 42C",
    "CPU thermal throttling detected",
  ],
};

function pickWeighted<T>(weights: Array<{ value: T; weight: number }>): T {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let r = faker.number.int({ min: 1, max: total });
  for (const entry of weights) {
    r -= entry.weight;
    if (r <= 0) return entry.value;
  }
  return weights[0].value;
}

export async function seedAlerts(
  devices: Device[],
  clients: Client[],
  users: User[],
) {
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 86400000);
  const techUsers = users.filter((u) => u.role === "technician" || u.role === "admin");

  // Build weighted device pool (servers appear more often)
  const weightedDevicePool: Device[] = [];
  for (const device of devices) {
    const dtype = (device.type ?? "workstation") as DeviceType;
    const weight = DEVICE_ALERT_WEIGHT[dtype] ?? 1;
    for (let w = 0; w < weight; w++) {
      weightedDevicePool.push(device);
    }
  }

  // Client lookup
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const records: (AlertCreationAttributes & { createdAt: Date; updatedAt: Date })[] = [];
  const monitoringTicketRecords: (TicketCreationAttributes & { createdAt: Date; updatedAt: Date })[] = [];
  let nextTicketNum = 2501; // Continue after ticket seed

  for (let i = 0; i < TOTAL_ALERTS; i++) {
    const device = faker.helpers.arrayElement(weightedDevicePool);
    const dtype = (device.type ?? "workstation") as DeviceType;
    const possibleTypes = ALERT_TYPES_BY_DEVICE[dtype] ?? ["offline"];
    const alertType = faker.helpers.arrayElement(possibleTypes);
    const severity = pickWeighted(SEVERITY_WEIGHTS);
    const message = faker.helpers.arrayElement(MESSAGES[alertType]);
    const createdAt = faker.date.between({ from: oneYearAgo, to: now });
    const ageInDays = (now.getTime() - createdAt.getTime()) / 86400000;

    // Older alerts more likely to be acknowledged
    const ackProbability = Math.min(0.95, 0.5 + ageInDays / 365);
    const isAcknowledged =
      faker.datatype.boolean({ probability: 0.7 }) &&
      faker.datatype.boolean({ probability: ackProbability });

    let acknowledgedById: string | null = null;
    let acknowledgedAt: Date | null = null;
    let resolvedAt: Date | null = null;

    if (isAcknowledged) {
      acknowledgedById = faker.helpers.arrayElement(techUsers).id;
      acknowledgedAt = new Date(
        createdAt.getTime() +
          faker.number.int({ min: 60000, max: 14400000 }), // 1min - 4h
      );
      if (acknowledgedAt > now) acknowledgedAt = now;

      // Acknowledged alerts are often resolved
      if (faker.datatype.boolean({ probability: 0.8 })) {
        resolvedAt = new Date(
          acknowledgedAt.getTime() +
            faker.number.int({ min: 300000, max: 28800000 }), // 5min - 8h
        );
        if (resolvedAt > now) resolvedAt = now;
      }
    }

    records.push({
      deviceId: device.id,
      clientId: device.clientId,
      type: alertType,
      severity,
      message,
      isAcknowledged,
      acknowledgedById,
      acknowledgedAt,
      resolvedAt,
      createdAt,
      updatedAt: resolvedAt ?? acknowledgedAt ?? createdAt,
    });

    // 30% of alerts create a monitoring ticket
    if (faker.datatype.boolean({ probability: 0.3 })) {
      const priority =
        severity === "critical"
          ? "critical"
          : severity === "warning"
            ? "high"
            : "medium";

      const ticketCreatedAt = new Date(
        createdAt.getTime() + faker.number.int({ min: 1000, max: 60000 }),
      );
      const isTicketResolved = resolvedAt != null;

      monitoringTicketRecords.push({
        ticketNumber: `TKT-${String(nextTicketNum++).padStart(5, "0")}`,
        clientId: device.clientId,
        assignedToId: acknowledgedById ?? faker.helpers.arrayElement(techUsers).id,
        deviceId: device.id,
        subject: `[Auto] ${message}`,
        description: `Automatically generated from monitoring alert on ${device.hostname}.\nSeverity: ${severity}\nType: ${alertType}`,
        priority,
        status: isTicketResolved ? "closed" : "open",
        category: alertType === "security_threat" ? "security" : "hardware",
        source: "monitoring" as const,
        responseTimeMinutes: isAcknowledged
          ? Math.round(
              (acknowledgedAt!.getTime() - createdAt.getTime()) / 60000,
            )
          : null,
        resolutionTimeMinutes: resolvedAt
          ? Math.round((resolvedAt.getTime() - createdAt.getTime()) / 60000)
          : null,
        resolvedAt: resolvedAt,
        closedAt: resolvedAt,
        createdAt: ticketCreatedAt,
        updatedAt: resolvedAt ?? ticketCreatedAt,
      });
    }
  }

  // Bulk insert alerts
  const BATCH = 500;
  let alertsCreated = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    await Alert.bulkCreate(batch, { validate: false });
    alertsCreated += batch.length;
  }

  // Bulk insert monitoring tickets
  let ticketsCreated = 0;
  for (let i = 0; i < monitoringTicketRecords.length; i += BATCH) {
    const batch = monitoringTicketRecords.slice(i, i + BATCH);
    await Ticket.bulkCreate(batch, { validate: false });
    ticketsCreated += batch.length;
  }

  console.log(
    `  Seeded ${alertsCreated} alerts (${ticketsCreated} generated monitoring tickets)`,
  );
}
