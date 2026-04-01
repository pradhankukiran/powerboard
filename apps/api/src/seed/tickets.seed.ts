import { faker } from "@faker-js/faker";
import { Client } from "../models/Client.js";
import { Device } from "../models/Device.js";
import { User } from "../models/User.js";
import { Ticket, TicketCreationAttributes } from "../models/Ticket.js";

type Priority = "critical" | "high" | "medium" | "low";
type Status = "open" | "in_progress" | "waiting_on_client" | "escalated" | "resolved" | "closed";
type Category =
  | "hardware"
  | "software"
  | "network"
  | "security"
  | "email"
  | "printing"
  | "other";
type Source = "phone" | "email" | "portal" | "monitoring" | "walk_in";

const TOTAL_TICKETS = 2500;

const PRIORITY_WEIGHTS: Array<{ value: Priority; weight: number }> = [
  { value: "critical", weight: 5 },
  { value: "high", weight: 15 },
  { value: "medium", weight: 50 },
  { value: "low", weight: 30 },
];

const CATEGORY_WEIGHTS: Array<{ value: Category; weight: number }> = [
  { value: "software", weight: 25 },
  { value: "hardware", weight: 20 },
  { value: "network", weight: 15 },
  { value: "security", weight: 15 },
  { value: "email", weight: 10 },
  { value: "printing", weight: 10 },
  { value: "other", weight: 5 },
];

const SOURCE_WEIGHTS: Array<{ value: Source; weight: number }> = [
  { value: "portal", weight: 30 },
  { value: "email", weight: 25 },
  { value: "phone", weight: 20 },
  { value: "monitoring", weight: 15 },
  { value: "walk_in", weight: 10 },
];

// Log-normal average resolution times in minutes by priority
const RESOLUTION_AVG: Record<Priority, number> = {
  critical: 120, // 2h
  high: 480, // 8h
  medium: 1440, // 24h
  low: 4320, // 72h
};

const SUBJECTS_BY_CATEGORY: Record<Category, string[]> = {
  software: [
    "Microsoft Office 365 not activating",
    "Application crashing on startup",
    "Software update failing to install",
    "QuickBooks license expired",
    "VPN client unable to connect",
    "Adobe Acrobat performance issues",
    "Browser extension causing conflicts",
    "Antivirus quarantined business file",
    "ERP system slow to respond",
    "Teams screen share not working",
  ],
  hardware: [
    "Laptop screen flickering intermittently",
    "Desktop not powering on",
    "Keyboard keys unresponsive",
    "Monitor displaying artifacts",
    "Docking station USB ports failing",
    "Hard drive making clicking noises",
    "Laptop battery not charging",
    "RAM upgrade requested",
    "Fan running at full speed constantly",
    "Touchpad not responding after update",
  ],
  network: [
    "Slow internet speeds in office",
    "WiFi dropping connections frequently",
    "Cannot access shared network drive",
    "VoIP phone call quality degraded",
    "DNS resolution failures",
    "Switch port flapping",
    "VPN tunnel keeps disconnecting",
    "DHCP lease exhaustion in subnet",
    "Network printer unreachable",
    "Intermittent packet loss on WAN link",
  ],
  security: [
    "Suspicious login attempts detected",
    "Phishing email reported by user",
    "Ransomware alert triggered on endpoint",
    "Firewall rule change request",
    "MFA not working for user account",
    "Expired SSL certificate on web portal",
    "Unauthorized USB device connected",
    "Failed security audit finding",
    "Account lockout due to brute force",
    "Data breach investigation required",
  ],
  email: [
    "Cannot send emails to external domain",
    "Outlook not syncing new messages",
    "Mailbox storage quota exceeded",
    "Distribution list not delivering",
    "Email signature not appearing",
    "Calendar invites not being received",
    "Shared mailbox permissions issue",
    "Auto-reply not activating",
    "Email attachment size limit reached",
    "Spam filter blocking legitimate email",
  ],
  printing: [
    "Printer paper jam won't clear",
    "Print jobs stuck in queue",
    "Color printing output faded",
    "Printer offline after firmware update",
    "Duplex printing not working",
    "Network printer driver installation",
    "Toner replacement needed",
    "Scan to email not functioning",
    "Print server spooler crashing",
    "Printer sharing access denied",
  ],
  other: [
    "New employee onboarding setup",
    "Conference room AV equipment issue",
    "UPS battery replacement needed",
    "Office relocation IT planning",
    "Vendor access provisioning request",
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

/**
 * Generate a log-normal random value.
 * mean: desired arithmetic mean, sigma: log-space std dev
 */
function logNormal(mean: number, sigma = 0.8): number {
  // Convert arithmetic mean to log-space mu
  const mu = Math.log(mean) - (sigma * sigma) / 2;
  // Box-Muller transform for normal variate
  const u1 = Math.max(1e-10, Math.random());
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(mu + sigma * z);
}

function pickStatusByAge(
  ageInDays: number,
  isResolved: boolean,
): { status: Status; resolvedAt: Date | null; closedAt: Date | null } {
  if (isResolved) {
    const isClosed = faker.datatype.boolean({ probability: 0.7 });
    return {
      status: isClosed ? "closed" : "resolved",
      resolvedAt: null, // filled in later
      closedAt: null,
    };
  }

  const activeStatuses: Array<{ value: Status; weight: number }> = [
    { value: "open", weight: 30 },
    { value: "in_progress", weight: 35 },
    { value: "waiting_on_client", weight: 20 },
    { value: "escalated", weight: 15 },
  ];
  return {
    status: pickWeighted(activeStatuses),
    resolvedAt: null,
    closedAt: null,
  };
}

export async function seedTickets(
  clients: Client[],
  users: User[],
  devices: Device[],
) {
  const techUsers = users.filter((u) => u.role === "technician");
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 86400000);

  // Build client -> devices lookup
  const clientDevices: Record<string, Device[]> = {};
  for (const d of devices) {
    if (!clientDevices[d.clientId]) clientDevices[d.clientId] = [];
    clientDevices[d.clientId].push(d);
  }

  // Generate 2-3 random "incident weeks" (week start dates)
  const incidentWeeks = new Set<number>();
  const totalWeeks = 52;
  while (incidentWeeks.size < faker.number.int({ min: 2, max: 3 })) {
    incidentWeeks.add(faker.number.int({ min: 0, max: totalWeeks - 1 }));
  }

  // Generate ticket creation dates with weekday bias and incident spikes
  const dates: Date[] = [];
  while (dates.length < TOTAL_TICKETS) {
    const d = faker.date.between({ from: oneYearAgo, to: now });
    const dayOfWeek = d.getDay();

    // Skip weekend tickets 70% of the time
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (faker.datatype.boolean({ probability: 0.7 })) continue;
    }

    // Check if in incident week - add extra tickets
    const weekNum = Math.floor(
      (d.getTime() - oneYearAgo.getTime()) / (7 * 86400000),
    );
    if (incidentWeeks.has(weekNum)) {
      // Triple volume: add 2 extras
      dates.push(d, new Date(d.getTime() + faker.number.int({ min: 0, max: 86400000 })));
    }

    dates.push(d);
  }

  // Sort chronologically, trim to exact count
  dates.sort((a, b) => a.getTime() - b.getTime());
  const ticketDates = dates.slice(0, TOTAL_TICKETS);

  const records: (TicketCreationAttributes & { createdAt: Date; updatedAt: Date })[] = [];

  for (let i = 0; i < TOTAL_TICKETS; i++) {
    const createdAt = ticketDates[i];
    const ageInDays = (now.getTime() - createdAt.getTime()) / 86400000;

    const priority = pickWeighted(PRIORITY_WEIGHTS);
    const category = pickWeighted(CATEGORY_WEIGHTS);
    const source = pickWeighted(SOURCE_WEIGHTS);
    const client = faker.helpers.arrayElement(clients);
    const tech = faker.helpers.arrayElement(techUsers);

    // Pick a random device from same client (if available)
    const devicesForClient = clientDevices[client.id] || [];
    const device =
      devicesForClient.length > 0
        ? faker.helpers.arrayElement(devicesForClient)
        : null;

    // Determine if resolved based on age
    let resolvedProbability: number;
    if (ageInDays > 30) resolvedProbability = 0.9;
    else if (ageInDays > 7) resolvedProbability = 0.6;
    else resolvedProbability = 0.3;

    const isResolved = faker.datatype.boolean({ probability: resolvedProbability });
    const { status } = pickStatusByAge(ageInDays, isResolved);

    // Resolution & response times
    let resolutionTimeMinutes: number | null = null;
    let responseTimeMinutes: number | null = null;
    let resolvedAt: Date | null = null;
    let closedAt: Date | null = null;

    if (status === "resolved" || status === "closed") {
      resolutionTimeMinutes = Math.round(logNormal(RESOLUTION_AVG[priority]));
      // Cap at reasonable max
      resolutionTimeMinutes = Math.min(resolutionTimeMinutes, 20160); // 2 weeks
      responseTimeMinutes = Math.round(resolutionTimeMinutes / 4);
      resolvedAt = new Date(
        createdAt.getTime() + resolutionTimeMinutes * 60000,
      );
      // Don't let resolvedAt be in the future
      if (resolvedAt > now) resolvedAt = new Date(now.getTime() - 3600000);

      if (status === "closed") {
        closedAt = new Date(
          resolvedAt.getTime() + faker.number.int({ min: 3600000, max: 172800000 }),
        );
        if (closedAt > now) closedAt = now;
      }
    } else if (status === "in_progress" || status === "escalated") {
      // Has response time but no resolution
      responseTimeMinutes = Math.round(logNormal(RESOLUTION_AVG[priority] / 4));
    }

    const subject = faker.helpers.arrayElement(SUBJECTS_BY_CATEGORY[category]);

    records.push({
      ticketNumber: `TKT-${String(i + 1).padStart(5, "0")}`,
      clientId: client.id,
      assignedToId: tech.id,
      deviceId: device?.id ?? null,
      subject,
      description: faker.lorem.paragraph(),
      priority,
      status,
      category,
      source,
      responseTimeMinutes,
      resolutionTimeMinutes,
      resolvedAt,
      closedAt,
      createdAt,
      updatedAt: resolvedAt ?? createdAt,
    });
  }

  // bulkCreate in batches (Postgres has param limits)
  const BATCH = 500;
  let created = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    await Ticket.bulkCreate(batch, { validate: false });
    created += batch.length;
  }

  console.log(`  Seeded ${created} tickets across 12 months`);
}
