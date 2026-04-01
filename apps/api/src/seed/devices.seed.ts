import { faker } from "@faker-js/faker";
import { Client } from "../models/Client.js";
import { Device, DeviceCreationAttributes } from "../models/Device.js";

type DeviceType =
  | "workstation"
  | "server"
  | "printer"
  | "firewall"
  | "switch"
  | "access_point"
  | "ups";

type Status = "online" | "offline" | "degraded" | "maintenance";

const DEVICE_COUNT_RANGES: Record<string, [number, number]> = {
  platinum: [40, 60],
  gold: [20, 40],
  silver: [10, 20],
  bronze: [5, 15],
};

// Weighted type distribution
const TYPE_WEIGHTS: Array<{ type: DeviceType; weight: number }> = [
  { type: "workstation", weight: 50 },
  { type: "server", weight: 15 },
  { type: "printer", weight: 15 },
  { type: "firewall", weight: 10 },
  { type: "switch", weight: 5 },
  { type: "access_point", weight: 3 },
  { type: "ups", weight: 2 },
];

const OS_MAP: Record<DeviceType, string[] | null> = {
  workstation: ["Windows 11 Pro", "Windows 10 Pro", "Windows 11 Enterprise", "macOS Sonoma"],
  server: [
    "Windows Server 2022",
    "Windows Server 2019",
    "Ubuntu 22.04 LTS",
    "Ubuntu 24.04 LTS",
    "Rocky Linux 9",
  ],
  printer: null,
  firewall: ["pfSense 2.7", "FortiOS 7.4", "OPNsense 24.1"],
  switch: ["Cisco IOS 17.x", "Aruba AOS-CX", "UniFi OS 3.x"],
  access_point: ["UniFi OS 3.x", "Aruba Instant OS"],
  ups: null,
};

const MANUFACTURER_MAP: Record<DeviceType, string[]> = {
  workstation: ["Dell", "HP", "Lenovo", "Apple"],
  server: ["Dell", "HP Enterprise", "Lenovo", "Supermicro"],
  printer: ["HP", "Brother", "Canon", "Xerox", "Lexmark"],
  firewall: ["Netgate", "Fortinet", "Cisco", "SonicWall"],
  switch: ["Cisco", "Aruba", "Ubiquiti", "Juniper"],
  access_point: ["Ubiquiti", "Aruba", "Cisco Meraki"],
  ups: ["APC", "CyberPower", "Eaton", "Tripp Lite"],
};

const HOSTNAME_PREFIX: Record<DeviceType, string> = {
  workstation: "WS",
  server: "SRV",
  printer: "PRT",
  firewall: "FW",
  switch: "SW",
  access_point: "AP",
  ups: "UPS",
};

function pickWeightedType(): DeviceType {
  const total = TYPE_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = faker.number.int({ min: 1, max: total });
  for (const entry of TYPE_WEIGHTS) {
    r -= entry.weight;
    if (r <= 0) return entry.type;
  }
  return "workstation";
}

function pickStatus(): Status {
  const r = faker.number.float({ min: 0, max: 1 });
  if (r < 0.85) return "online";
  if (r < 0.90) return "offline";
  if (r < 0.97) return "degraded";
  return "maintenance";
}

function abbreviate(name: string): string {
  // "Pinnacle Healthcare" -> "PINHLTH"
  // Take first 3 chars of each word, uppercase, join, max 8 chars
  return name
    .split(/\s+/)
    .map((w) => w.slice(0, 3).toUpperCase())
    .join("")
    .slice(0, 8);
}

export async function seedDevices(clients: Client[]) {
  const allRecords: DeviceCreationAttributes[] = [];
  const counters: Record<string, Record<DeviceType, number>> = {};

  for (const client of clients) {
    const [min, max] = DEVICE_COUNT_RANGES[client.slaLevel];
    const count = faker.number.int({ min, max });
    const abbr = abbreviate(client.name);
    counters[client.id] = {} as Record<DeviceType, number>;

    for (let i = 0; i < count; i++) {
      const type = pickWeightedType();
      counters[client.id][type] = (counters[client.id][type] || 0) + 1;
      const num = counters[client.id][type];

      const prefix = HOSTNAME_PREFIX[type];
      const hostname = `${prefix}-${abbr}-${String(num).padStart(3, "0")}`;

      const status = pickStatus();
      const now = new Date();
      let lastSeenAt: Date;
      if (status === "online") {
        // Within last hour
        lastSeenAt = new Date(now.getTime() - faker.number.int({ min: 0, max: 3600000 }));
      } else {
        // Within last week
        lastSeenAt = new Date(
          now.getTime() - faker.number.int({ min: 3600000, max: 7 * 86400000 }),
        );
      }

      const osOptions = OS_MAP[type];
      const os = osOptions ? faker.helpers.arrayElement(osOptions) : null;
      const manufacturer = faker.helpers.arrayElement(MANUFACTURER_MAP[type]);

      allRecords.push({
        clientId: client.id,
        hostname,
        type,
        os,
        ipAddress: faker.internet.ipv4({ network: "private-c" }),
        macAddress: faker.internet.mac(),
        manufacturer,
        model: `${manufacturer} ${faker.string.alphanumeric({ length: 4, casing: "upper" })}`,
        serialNumber: faker.string.alphanumeric({ length: 12, casing: "upper" }),
        status,
        lastSeenAt,
        warrantyExpiry: faker.date.between({
          from: new Date("2023-01-01"),
          to: new Date("2027-12-31"),
        }),
        purchasedAt: faker.date.past({ years: 5 }),
      });
    }
  }

  const devices = await Device.bulkCreate(allRecords);

  // Update client deviceCount
  for (const client of clients) {
    const count = devices.filter((d) => d.clientId === client.id).length;
    await client.update({ deviceCount: count });
  }

  console.log(`  Seeded ${devices.length} devices across ${clients.length} clients`);
  return devices;
}
