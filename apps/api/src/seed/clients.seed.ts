import { faker } from "@faker-js/faker";
import { Client } from "../models/Client.js";

type Industry =
  | "healthcare"
  | "finance"
  | "education"
  | "manufacturing"
  | "legal"
  | "retail"
  | "technology";

type SLALevel = "platinum" | "gold" | "silver" | "bronze";

interface ClientDef {
  name: string;
  industry: Industry;
  slaLevel: SLALevel;
}

const CLIENT_DEFS: ClientDef[] = [
  // 2 platinum
  { name: "Pinnacle Healthcare", industry: "healthcare", slaLevel: "platinum" },
  { name: "Atlas Financial Services", industry: "finance", slaLevel: "platinum" },
  // 3 gold
  { name: "Meridian Law Group", industry: "legal", slaLevel: "gold" },
  { name: "Summit Manufacturing Co", industry: "manufacturing", slaLevel: "gold" },
  { name: "TechNova Solutions", industry: "technology", slaLevel: "gold" },
  // 4 silver
  { name: "Crestview Academy", industry: "education", slaLevel: "silver" },
  { name: "Harbor Retail Group", industry: "retail", slaLevel: "silver" },
  { name: "Ironclad Security Partners", industry: "technology", slaLevel: "silver" },
  { name: "Greenfield Medical Center", industry: "healthcare", slaLevel: "silver" },
  // 3 bronze
  { name: "Lakeside Community College", industry: "education", slaLevel: "bronze" },
  { name: "Redstone Construction LLC", industry: "manufacturing", slaLevel: "bronze" },
  { name: "BrightPath Accounting", industry: "finance", slaLevel: "bronze" },
];

const RETAINER_RANGES: Record<SLALevel, [number, number]> = {
  platinum: [8000, 12000],
  gold: [4000, 7000],
  silver: [2000, 3500],
  bronze: [800, 1500],
};

export async function seedClients() {
  const records = CLIENT_DEFS.map((def) => {
    const [min, max] = RETAINER_RANGES[def.slaLevel];
    const retainer = faker.number.int({ min, max });

    return {
      name: def.name,
      industry: def.industry,
      slaLevel: def.slaLevel,
      contactEmail: faker.internet.email({
        firstName: "contact",
        lastName: def.name.split(" ")[0].toLowerCase(),
        provider: faker.internet.domainName(),
      }),
      contactPhone: faker.phone.number({ style: "national" }),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      monthlyRetainer: retainer,
      deviceCount: 0, // will be updated after devices seed
      isActive: true,
      onboardedAt: faker.date.past({ years: 3 }),
    };
  });

  const clients = await Client.bulkCreate(records);
  console.log(`  Seeded ${clients.length} clients (2 plat, 3 gold, 4 silver, 3 bronze)`);
  return clients;
}
