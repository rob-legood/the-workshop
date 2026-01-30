import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.signup.deleteMany();
  await prisma.slot.deleteMany();

  // Create sample slots
  const slot1 = await prisma.slot.create({
    data: {
      title: "React Server Components Deep Dive",
      description:
        "An in-depth look at RSC architecture, streaming, and how to migrate existing apps.",
      date: new Date("2026-02-15T10:00:00"),
      maxAttendees: 25,
    },
  });

  const slot2 = await prisma.slot.create({
    data: {
      title: "Building with AI Agents",
      description:
        "Demo of integrating LLM-powered agents into internal tooling and workflows.",
      date: new Date("2026-02-22T14:00:00"),
      maxAttendees: 30,
    },
  });

  await prisma.slot.create({
    data: {
      title: "Design System v2 Rollout",
      description:
        "Walkthrough of the new component library, migration guide, and Figma sync.",
      date: new Date("2026-03-01T11:00:00"),
      maxAttendees: 20,
    },
  });

  // Add a few sample signups
  await prisma.signup.createMany({
    data: [
      {
        name: "Alice Johnson",
        email: "alice@company.com",
        department: "Engineering",
        slotId: slot1.id,
      },
      {
        name: "Bob Smith",
        email: "bob@company.com",
        department: "Product",
        slotId: slot1.id,
      },
      {
        name: "Carol Williams",
        email: "carol@company.com",
        department: "Design",
        slotId: slot2.id,
      },
    ],
  });

  console.log("Seeded 3 slots and 3 signups.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
