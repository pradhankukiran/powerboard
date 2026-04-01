import { faker } from "@faker-js/faker";
import { User } from "../models/User.js";
import { Technician } from "../models/Technician.js";

const SPECIALIZATIONS = [
  "networking",
  "security",
  "hardware",
  "software",
  "email",
  "printing",
  "cloud",
] as const;

export async function seedTechnicians(users: User[]) {
  const techUsers = users.filter((u) => u.role === "technician");

  const records = techUsers.map((user, i) => {
    const specCount = faker.number.int({ min: 2, max: 3 });
    const specs = faker.helpers.arrayElements(
      [...SPECIALIZATIONS],
      specCount,
    );

    return {
      userId: user.id,
      specializations: specs,
      ticketsResolvedThisMonth: faker.number.int({ min: 15, max: 60 }),
      avgResolutionMinutes: faker.number.float({
        min: 30,
        max: 240,
        fractionDigits: 2,
      }),
      satisfactionScore: faker.number.float({
        min: 3.5,
        max: 5.0,
        fractionDigits: 2,
      }),
      isOnCall: i < 2, // first 2 techs are on-call
      hireDate: faker.date.past({ years: 5 }),
    };
  });

  const techs = await Technician.bulkCreate(records);
  console.log(`  Seeded ${techs.length} technician profiles`);
  return techs;
}
