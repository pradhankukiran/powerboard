import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const PASSWORD = "password123";

export async function seedUsers() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  const roles: Array<{ role: "admin" | "technician" | "viewer"; count: number }> = [
    { role: "admin", count: 3 },
    { role: "technician", count: 8 },
    { role: "viewer", count: 15 },
  ];

  const records: Array<{
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: "admin" | "technician" | "viewer";
    isActive: boolean;
    lastLoginAt: Date | null;
  }> = [
    {
      email: "admin@powerboard.io",
      passwordHash: hash,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true,
      lastLoginAt: new Date(),
    },
  ];

  for (const { role, count } of roles) {
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet
        .email({ firstName, lastName, provider: "powerboard.io" })
        .toLowerCase();

      records.push({
        email,
        passwordHash: hash,
        firstName,
        lastName,
        role,
        isActive: faker.datatype.boolean({ probability: 0.95 }),
        lastLoginAt: faker.date.recent({ days: 14 }),
      });
    }
  }

  const users = await User.bulkCreate(records);
  console.log(`  Seeded ${users.length} users (3 admin, 8 tech, 15 viewer)`);
  return users;
}
