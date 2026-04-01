import { faker } from "@faker-js/faker";
import { Client } from "../models/Client.js";
import { SLAMetric, SLAMetricCreationAttributes } from "../models/SLAMetric.js";

type SLALevel = "platinum" | "gold" | "silver" | "bronze";

interface SLAProfile {
  uptimeMin: number;
  uptimeMax: number;
  avgResponseMinutes: number;
  avgResolutionMinutes: number;
  maxBreachPerDay: number;
  ticketScale: number; // multiplier for daily tickets based on client size
}

const SLA_PROFILES: Record<SLALevel, SLAProfile> = {
  platinum: {
    uptimeMin: 99.95,
    uptimeMax: 99.99,
    avgResponseMinutes: 15,
    avgResolutionMinutes: 60,
    maxBreachPerDay: 0,
    ticketScale: 3,
  },
  gold: {
    uptimeMin: 99.8,
    uptimeMax: 99.95,
    avgResponseMinutes: 30,
    avgResolutionMinutes: 120,
    maxBreachPerDay: 1,
    ticketScale: 2,
  },
  silver: {
    uptimeMin: 99.5,
    uptimeMax: 99.8,
    avgResponseMinutes: 60,
    avgResolutionMinutes: 240,
    maxBreachPerDay: 2,
    ticketScale: 1.5,
  },
  bronze: {
    uptimeMin: 99.0,
    uptimeMax: 99.5,
    avgResponseMinutes: 120,
    avgResolutionMinutes: 480,
    maxBreachPerDay: 3,
    ticketScale: 1,
  },
};

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function seedSLAMetrics(clients: Client[]) {
  const now = new Date();
  const records: SLAMetricCreationAttributes[] = [];

  for (const client of clients) {
    const profile = SLA_PROFILES[client.slaLevel as SLALevel];

    // Generate 365 days of metrics
    for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
      const date = new Date(now.getTime() - (365 - dayOffset) * 86400000);
      const dateStr = formatDate(date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Uptime with occasional dips (1 in 30 days)
      let uptime: number;
      const isDipDay = faker.datatype.boolean({ probability: 1 / 30 });
      if (isDipDay) {
        const dipAmount = faker.number.float({ min: 1, max: 3 });
        uptime = Math.max(
          95.0,
          faker.number.float({
            min: profile.uptimeMin - dipAmount,
            max: profile.uptimeMax - dipAmount,
            fractionDigits: 2,
          }),
        );
      } else {
        uptime = faker.number.float({
          min: profile.uptimeMin,
          max: profile.uptimeMax,
          fractionDigits: 2,
        });
      }

      // Response time: base +/- 30% variance
      const responseVariance = profile.avgResponseMinutes * 0.3;
      const avgResponse = faker.number.float({
        min: Math.max(1, profile.avgResponseMinutes - responseVariance),
        max: profile.avgResponseMinutes + responseVariance,
        fractionDigits: 2,
      });

      // Resolution time: ~4x response
      const resolutionBase = profile.avgResolutionMinutes;
      const resolutionVariance = resolutionBase * 0.3;
      const avgResolution = faker.number.float({
        min: Math.max(5, resolutionBase - resolutionVariance),
        max: resolutionBase + resolutionVariance,
        fractionDigits: 2,
      });

      // Tickets: 0-5 based on client size, less on weekends
      const maxTickets = Math.round(5 * profile.ticketScale);
      let ticketsOpened: number;
      if (isWeekend) {
        ticketsOpened = faker.number.int({ min: 0, max: Math.max(1, Math.round(maxTickets * 0.3)) });
      } else {
        ticketsOpened = faker.number.int({ min: 0, max: maxTickets });
      }

      // Closed roughly tracks opened with slight lag
      const ticketsClosed = faker.number.int({
        min: Math.max(0, ticketsOpened - 2),
        max: ticketsOpened + 1,
      });

      // Breach count
      let breachCount: number;
      if (client.slaLevel === "platinum") {
        // Almost always 0
        breachCount = faker.datatype.boolean({ probability: 0.02 }) ? 1 : 0;
      } else if (isDipDay) {
        breachCount = faker.number.int({ min: 1, max: profile.maxBreachPerDay });
      } else {
        breachCount = faker.datatype.boolean({ probability: 0.1 })
          ? faker.number.int({ min: 0, max: Math.max(1, profile.maxBreachPerDay - 1) })
          : 0;
      }

      records.push({
        clientId: client.id,
        date: dateStr,
        uptimePercent: uptime,
        avgResponseMinutes: avgResponse,
        avgResolutionMinutes: avgResolution,
        ticketsOpened,
        ticketsClosed,
        breachCount,
      });
    }
  }

  // Bulk insert in batches
  const BATCH = 500;
  let created = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    await SLAMetric.bulkCreate(batch, { validate: false });
    created += batch.length;
  }

  console.log(
    `  Seeded ${created} SLA metric rows (${clients.length} clients x 365 days)`,
  );
}
